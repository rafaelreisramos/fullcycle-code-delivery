## Steps:

1. Set vm.max_map_count to at least 262144

How you set vm.max_map_count depends on your platform.
Linux
To view the current value for the vm.max_map_count setting, run:

```bash
grep vm.max_map_count /etc/sysctl.conf
```

To apply the setting on a live system, run:

```bash
sudo sysctl -w vm.max_map_count=262144
```

To permanently change the value for the vm.max_map_count setting, update the value in /etc/sysctl.conf.

2. Create a esdata01 folder in the project root and change permissions

```bash
mkdir esdata01
chmod g+rwx esdata01
chgrp 0 esdata01
```

Depends on your privileges chgrp sudo will be needed.

For more information access [Install Elasticsearch with Docker](https://www.elastic.co/guide/en/elasticsearch/reference/8.0/docker.html).

3. Run the compose file (use -d flag if you want to use dettached mode)

```bash
docker compose up
```

4. Wait until compose complete all tasks

5. Access the Concluent Control Center

6. Connect > connect-default > Add connector > Upload connector config file (elasticsearch.properties) > Continue > Launch
