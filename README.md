# restoreMeteorMongo
Utility for restoring the most recent version of a database dumped from mongo into meteor mongo

### Installation
1. Clone
2. Create a configuration file, as detailed below
3. Add `restoreMeteorMongo` to your path

### Instructions

Type `restoreMeteorMongo` in the directory that's currently running meteor. This will restore what's in your most recent dump and drop old versions of collections that are shared between the two.

### Assumptions
Everything in `dbDir` needs to meet the following requirements:

- Have a date string that can be understood by `new Date(name)` somewhere in the end of the title
- Be a folder created by `mongodump`

### config.json
````json
{
    "db": "myDbName",
    "dbDir": "/User/name/myDumpDir",
    "datePrefix": "backup-",
    "host": "127.0.0.1",
    "port": 3001
}
```
