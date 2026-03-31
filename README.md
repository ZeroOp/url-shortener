# Project Documentation

Welcome to the URL Shortener project documentation. Below are the detailed docs for each part of the system:

- [Overall Architecture](docs/architecture.md)
- [Auth Service](docs/auth-service.md)
- [URL Service](docs/url-service.md)
- [Analytics Service](docs/analytics-service.md)
- [Counter Service](docs/counter-service.md)
- [Database Schema](docs/database.md)
- [Caching Strategy](docs/caching.md)

when you run the setup for the first time need to setup the replica sets

kubectl exec -it mongo-0 -- mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'<IP_OF_MONGO_0>:27017'},{_id:1,host:'<IP_OF_MONGO_1>:27017'},{_id:2,host:'<IP_OF_MONGO_2>:27017'}]})"