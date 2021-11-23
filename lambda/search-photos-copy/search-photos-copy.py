import boto3
import json
from requests_aws4auth import AWS4Auth
from opensearchpy import OpenSearch, RequestsHttpConnection
import requests


def lambda_handler(event, context):
    # get user query from API gateway
    query = event["queryStringParameters"]["q"]

    # parse keywords by lex
    lex = boto3.client('lex-runtime')
    lex_response = lex.post_text(
        botName='PhotoSearch',
        botAlias='Prod',
        userId='chi',
        inputText=query
    )
    slots = lex_response['slots']
    print(slots)

    # get image list from opensearch
    region = 'us-east-1'
    Open_Search_Host = 'https://search-photos-hq2sekfdz7c4pyhmhjf4cevtve.us-east-1.es.amazonaws.com'
    host = 'search-photos-hq2sekfdz7c4pyhmhjf4cevtve.us-east-1.es.amazonaws.com'
    index = 'photos'
    type = 'image'
    url = Open_Search_Host + '/' + index + '/' + type

    headers = {"Content-Type": "application/json"}

    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

    def get_url(es_index, es_type, keyword):
        url = Open_Search_Host + '/' + es_index + '/' + es_type + '/_search?q=' + keyword.lower()
        return url

    img_list = []
    for _, tag in slots.items():
        if not tag:
            continue

        if tag == 'mice':
            tag_modify = 'mouse'

        if tag.endswith('s'):
            tag_modify = tag[:-1]
        elif tag.endswith('shes') or tag.endswith('ches') or tag.endswith('ses') or tag.endswith('xes') or tag.endswith(
                'zes'):
            tag_modify = tag[:-2]
        elif tag.endswith('ies'):
            tag_modify = tag[:-3]
            tag_modify += 'y'
        else:
            tag_modify = tag

        print(tag, tag_modify)
        tag = tag_modify

        url = get_url(index, type, tag)
        print("ES URL --- {}".format(url))

        es_response = requests.get(url, auth=awsauth, headers=headers).json()
        print("ES RESPONSE --- {}".format(json.dumps(es_response)))

        es_src = es_response['hits']['hits']
        print("ES HITS --- {}".format(json.dumps(es_src)))

        for photo in es_src:
            labels = [word.lower() for word in photo['_source']['labels']]
            if tag in labels:
                objectKey = photo['_source']['objectKey']
                img_url = 'https://s3.amazonaws.com/photos-storehouse/' + objectKey
                img_list.append(img_url)
    print("ES IMAGES LIST --- {}".format(img_list))

    if img_list:
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'

            },
            'body': json.dumps(img_list)
        }
    else:
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            },
            'body': json.dumps("No such photos.")
        }
