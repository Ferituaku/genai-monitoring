import clickhouse_connect

client = clickhouse_connect.get_client(
    host='openlit.my.id', 
    port='8123', 
    database="openlit", 
    username='default',
    password='OPENLIT',
    secure=False
)
