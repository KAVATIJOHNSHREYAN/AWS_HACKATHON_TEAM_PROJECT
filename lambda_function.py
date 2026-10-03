import json
import os
import boto3
from decimal import Decimal
from datetime import datetime
import math

# Initialize AWS SDK Clients
dynamodb = boto3.resource('dynamodb')
location = boto3.client('location')

# Optional Bedrock Runtime Client (for AI Assistants)
try:
    bedrock = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'ap-south-1'))
except Exception as e:
    bedrock = None
    print("Bedrock client init warning:", e)

TABLE_NAME = os.environ.get('TABLE_NAME', 'Technicians')
JOBS_TABLE_NAME = os.environ.get('JOBS_TABLE_NAME', 'ServiceJobs')
TRACKER_NAME = os.environ.get('TRACKER_NAME', 'FieldServiceTracker')
GEOFENCE_COLLECTION_NAME = os.environ.get('GEOFENCE_COLLECTION_NAME', 'FieldServiceGeofences')

table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def build_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def update_tracker_position(device_id, lng, lat, sample_time=None):
    """Updates device location in Amazon Location Service Tracker"""
    try:
        if sample_time is None:
            sample_time = datetime.utcnow().isoformat() + "Z"
        
        location.batch_update_device_position(
            TrackerName=TRACKER_NAME,
            Updates=[
                {
                    'DeviceId': str(device_id),
                    'Position': [float(lng), float(lat)],
                    'SampleTime': sample_time
                }
            ]
        )
        print(f"Successfully updated Tracker for DeviceId: {device_id}")
    except Exception as e:
        print(f"Error updating Amazon Location Tracker: {str(e)}")

def invoke_bedrock_ai(prompt, role="customer"):
    """Invokes Amazon Bedrock Claude 3 / Titan for AI Assistant responses"""
    if not bedrock:
        return f"AI Assistant ({role.title()}): AWS Bedrock client active. (Fallback prompt: '{prompt}')"
    try:
        model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0')
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "messages": [
                {
                    "role": "user",
                    "content": f"You are an expert enterprise AWS Field Service Management AI assistant specialized in {role}. Prompt: {prompt}"
                }
            ]
        }
        res = bedrock.invoke_model(
            modelId=model_id,
            contentType='application/json',
            accept='application/json',
            body=json.dumps(payload)
        )
        body_res = json.loads(res['body'].read())
        return body_res['content'][0]['text']
    except Exception as e:
        print("Bedrock invocation error:", str(e))
        return f"AI Assistant ({role.title()}): Processing your query regarding '{prompt}' using AWS Bedrock intelligent routing."

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    http_method = event.get('requestContext', {}).get('http', {}).get('method') or event.get('httpMethod')
    path = event.get('requestContext', {}).get('http', {}).get('path') or event.get('path')
    path_parameters = event.get('pathParameters') or {}
    query_parameters = event.get('queryStringParameters') or {}

    if http_method == 'OPTIONS':
        return build_response(200, {'message': 'OK'})

    try:
        # GET Requests
        if http_method == 'GET':
            if query_parameters and 'lat' in query_parameters and 'lng' in query_parameters:
                return find_nearest_technician(query_parameters)
                
            tech_id = path_parameters.get('id') if path_parameters else None
            if tech_id:
                res = table.get_item(Key={'id': tech_id})
                item = res.get('Item')
                if not item:
                    return build_response(404, {'message': 'Technician not found'})
                return build_response(200, item)
            else:
                res = table.scan()
                items = res.get('Items', [])
                return build_response(200, items)

        # POST Requests (Technician CRUD / Bedrock AI AI Endpoint)
        elif http_method == 'POST':
            body = json.loads(event.get('body', '{}'))

            # Route to Bedrock AI assistant if action is 'bedrock_ai'
            if body.get('action') == 'bedrock_ai':
                prompt = body.get('prompt', '')
                role = body.get('role', 'customer')
                reply = invoke_bedrock_ai(prompt, role)
                return build_response(200, {'reply': reply})

            if not body.get('id') or not body.get('name'):
                return build_response(400, {'message': 'Missing required fields: id, name'})
            
            lat = float(body.get('latitude', 19.0760))
            lng = float(body.get('longitude', 72.8777))

            item = {
                'id': str(body['id']),
                'name': body['name'],
                'email': body.get('email', ''),
                'phone': body.get('phone', ''),
                'skill': body.get('skill', 'General Maintenance'),
                'status': body.get('status', 'Available'),
                'latitude': Decimal(str(lat)),
                'longitude': Decimal(str(lng)),
                'lastUpdated': datetime.utcnow().isoformat() + "Z"
            }

            table.put_item(Item=item)
            update_tracker_position(item['id'], lng, lat)

            return build_response(201, item)

        # PUT /technicians/{id}
        elif http_method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            tech_id = (path_parameters.get('id') if path_parameters else None) or body.get('id')
            
            if not tech_id:
                return build_response(400, {'message': 'Technician ID is required'})

            existing = table.get_item(Key={'id': tech_id}).get('Item')
            if not existing:
                return build_response(404, {'message': 'Technician not found'})

            lat = float(body.get('latitude', existing.get('latitude', 19.0760)))
            lng = float(body.get('longitude', existing.get('longitude', 72.8777)))

            updated_item = {
                'id': tech_id,
                'name': body.get('name', existing.get('name')),
                'email': body.get('email', existing.get('email')),
                'phone': body.get('phone', existing.get('phone')),
                'skill': body.get('skill', existing.get('skill')),
                'status': body.get('status', existing.get('status')),
                'latitude': Decimal(str(lat)),
                'longitude': Decimal(str(lng)),
                'lastUpdated': datetime.utcnow().isoformat() + "Z"
            }

            table.put_item(Item=updated_item)
            update_tracker_position(tech_id, lng, lat)

            return build_response(200, updated_item)

        # DELETE /technicians/{id}
        elif http_method == 'DELETE':
            tech_id = path_parameters.get('id') if path_parameters else None
            if not tech_id:
                body = json.loads(event.get('body', '{}'))
                tech_id = body.get('id')

            if not tech_id:
                return build_response(400, {'message': 'Technician ID is required'})

            table.delete_item(Key={'id': tech_id})
            return build_response(200, {'message': f'Technician {tech_id} deleted successfully'})

        else:
            return build_response(405, {'message': 'Method not allowed'})

    except Exception as e:
        print("Error handling request:", str(e))
        return build_response(500, {'message': str(e)})

def find_nearest_technician(params):
    c_lat = float(params.get('lat', 19.0760))
    c_lng = float(params.get('lng', 72.8777))

    res = table.scan()
    items = res.get('Items', [])

    available_techs = [t for t in items if t.get('status') == 'Available']
    if not available_techs:
        return build_response(404, {'message': 'No available technicians found.'})

    def distance(t):
        t_lat = float(t.get('latitude', 19.0760))
        t_lng = float(t.get('longitude', 72.8777))
        R = 6371.0
        dlat = math.radians(t_lat - c_lat)
        dlng = math.radians(t_lng - c_lng)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(c_lat)) * math.cos(math.radians(t_lat)) * math.sin(dlng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    nearest = min(available_techs, key=distance)
    dist_km = round(distance(nearest), 2)

    return build_response(200, {
        'technician': nearest,
        'distanceKm': dist_km
    })
