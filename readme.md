# APP STRUCTURE 
All the code for the application is located in the `src folder`  
The src folder contains 
1. __test__ folder: which contains test cases written in jest
2. utils folder: contains the broker class, db-functions and helper methods for the application
3. app.ts: the starting point of the application. 


# RUNNING THE APPLICATION 
> docker build -t emma .

# START APPLICATION 
> docker run -p 3000:3000 emma


# TESTING THE APPLICATION 
```js

POST http://localhost:3000/claim-free-share 
Content-Type: application/json

{
    "userId":2
}

```

# NOTES 
For easy testing the application uses an in memory sqlite db, create seed tables and data for the following:

1. users - default base users 
2. Tradable assets 

These are located in 'src/utils/db-function.ts' 

All other parts of the code are documented
