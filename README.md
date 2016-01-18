# meteor-backup
Utility for managing and restoring mongodb backups for meteor projects

### Installation
1. Clone
2. Add `meteor-backup` to your path

### Configuration

1. Decide where you want to store your backups (defaults to `~/meteorMongoDump`)

    `meteor-backup -D [dirname] --save`

2. Add the host, port, db and authentication db of the database you want to backup

    `meteor-backup -h [host] -p [port] -d [name] -a [name] --save`

3. Add the local host and port if you're runnining meteor's local mongodb somewher other than `localhost:3001`

    `meteor-backup -H [host] -P [port] --save`
    
4. Check configuration and finish

    `meteor-backup -i`


### Backup

`meteor-backup dump`

This will execute `meteor-dump` and save it in the folder you defined during configuration. It will be called `[datePrefix][date]`, where `[datePrefix]` is any string and `[date]` is a datestring. `[datePrefix]` has a default value of `backup-`.

### Restore

`meteor-backup restore`

Run the above command in the same directory running your meteor app. It will list the backups in your folder and allow you to select one to copy into meteor. 

**IMPORTANT:** This will replace collections that exist in your current meteor app with collections in your backup. Collections not in your backup will not be dropped. Collections in your app that are also in your backup will *replace* (not be merged with) your current app.

### Sync

`meteor-backup sync`

This is the same as running `meteor-backup dump` and then selecting the backup you just made with `meteor-backup restore`
