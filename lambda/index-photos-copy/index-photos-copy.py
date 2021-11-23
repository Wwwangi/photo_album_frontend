import boto3
from requests_aws4auth import AWS4Auth
from opensearchpy import OpenSearch, RequestsHttpConnection
import requests
import json

region = 'us-east-1'
Open_Search_Host = 'https://search-photos-hq2sekfdz7c4pyhmhjf4cevtve.us-east-1.es.amazonaws.com'
index = 'photos'
type = 'image'
url = Open_Search_Host + '/' + index + '/' + type

headers = {"Content-Type": "application/json"}

service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

s3 = boto3.client('s3')


def lambda_handler(event, context):
    print("copyyyyyy11111122222 event: ", event)

    # # search by query
    # search_item = 'dog.jpeg'
    # search_url = url + '/_search?q=' + search_item
    # es_response = requests.get(search_url , auth=awsauth, headers=headers).json()
    # es_src = es_response['hits']['hits']
    # print(es_src)

    # # delete by query
    # delete_item = 'dog.jpeg'
    # delete_by_query_url = Open_Search_Host + '/' + index + '/_delete_by_query?q=' + delete_item
    # es_response = requests.post(delete_by_query_url, auth=awsauth, headers=headers)
    # print(es_response)

    # # delete by id
    # delete_id = '??????????'
    # delete_by_id_url = Open_Search_Host + '/' + index + '/_doc/' + delete_id
    # es_response = requests.delete(url , auth=awsauth, headers=headers)
    # print(es_response)

    rekognition = boto3.client('rekognition')

    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        name = record['s3']['object']['key']
        timestamp = record['eventTime']

        # get the metadata from s3
        metadata = s3.head_object(
            Bucket=bucket,
            Key=name)
        print(metadata)

        labels = rekognition.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': name
                }
            },
            MaxLabels=10,
            MinConfidence=80
        )
        print('labels: ', labels)

        detect_labels = []
        for label in labels['Labels']:
            detect_labels.append(label['Name'])

        customLabels = metadata['Metadata']['customlabels']
        if customLabels:
            customLabels = customLabels.split(',')
        for label in customLabels:
            detect_labels.append(label)

        print("detect labels: ", detect_labels)

        document = {
            "objectKey": name,
            "bucket": bucket,
            "labels": detect_labels,
            "timestamp": timestamp
        }
        print(document)

        r = requests.post(url, auth=awsauth, headers=headers, data=json.dumps(document))
        print(r.text)