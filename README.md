# API Documentation
# Introduction
This is a short-url service which has endpoints to encode a given url into a shorter url, endpoint to decode / retrieve the original url of a given short-url's path (referred to as shortCode in this app) and endpoint to get statistical data about a given url_path (shortCode).

'''
- shortUrl's path (shortCode) is generated with algorithm to be unique and with high combination value to increase scalability;
'''
- Validation also rejects non-working url domains using the dns lookup module.

# VCS Repo
Github - all dev time code are pushed to development branch before merging to main

# To install dependencies:
``` bash
npm install
```
# To Run
``` bash
npm run start
```
# To run Tests:
 Tests include positive and negative test cases
``` bash
npm run test
```

# Endpoints
This API has a general format / interface for all endpoints 
ie:
``` json
{
  data: ResultType,
  status: boolean // successsful processes is true
  statusCode: number // response http status code
  message: string
  error: ErrorResultType // if process returns error
}
```

__POST /encode__
- Create a short-url for a given url.
- urls with invalid / non-working domain servers are also   rejected.

Request Body:
``` json
{
  url: "http://google.com"
}
```
url (required): url to be encoded into shorter url.

__Response:__

- 
  Status Code: 201 (Created)
  Response Body:

``` json
{
    "message": "url encoded successfully",
    "status": true,
    "statusCode": 200,
    "data": {
        "originalUrl": "http://bbc.co.uk",
        "shortUrl": "http://localhost:3003/21e50f25520",
        "shortCode": "21e50f25520"
    }
}
```

__POST /decode__
-
  Decode a given short_url's path (shortCode).

- Request Body:

``` json
{
  "shortCode": "21e50f25520",
}
```

- Response:
``` json
{
    "message": "url code decoded successfully",
    "status": true,
    "statusCode": 200,
    "data": {
        "originalUrl": "http://bbc.co.uk",
        "shortUrl": "http://localhost:3003/21e50f25520",
        "shortCode": "21e50f25520",
        "originalUrlStatus": "up"
    }
}
```

__GET /statistics/{url_path}__
- Gets the statistical data of a given url_path (shortCode);

_Request Paramenter_
- url_path {required} - the shortCode generated for the shortUrl

Response:
- StatusCode: 200 (OK)
``` json
{
    "message": "url statistics got successfully",
    "status": true,
    "statusCode": 200,
    "data": {
        "originalUrl": "http://bbc.co.uk",
        "shortUrl": "http://localhost:3003/21e50f25520",
        "shortCode": "21e50f25520",
        "registeredAt": "2023-06-03T14:38:25.780Z",
        "createdBy": "::1",
        "numberOfVisits": 1,
        "numberOfFailedRedirects": 0,
        "urlServerDownAtRedirects": 0,
        "originalUrlStatus": "up"
    }
}
```
- NB:

        "urlServerDownAtRedirects": 0, // increments when dns lookup fails after a url must have been successfully registered earlier
        
        "originalUrlStatus": Value is "up" or "down" - also determined by the CURRENT, AT THE REQUEST INSTANT dns lookup of the originalUrl 
    
        "createdBy" - for this demo, tracks the user that registered the url; by the request.ip of the /encode endpoint

# Error Handling
  Errors are identified in the statusCodes and the value of the status field with false value. The message field is also populated with the error message. The error field may also be poppulated with an object of more details.

  




