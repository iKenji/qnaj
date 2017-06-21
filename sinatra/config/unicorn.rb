@app_path = '/home/nginx/qnaj/sinatra'
# @app_path = '/vagrant/sinatra'

worker_processes 2
working_directory "#{@app_path}/"

# This loads the application in the master process before forking
# worker processes
# Read more about it here:
# http://unicorn.bogomips.org/Unicorn/Configurator.html
preload_app true
timeout 30
# This is where we specify the socket.
# We will point the upstream Nginx module to this socket later on
listen "#{@app_path}/tmp/unicorn.sock"
#listen "/var/run/unicorn.sock"
pid "#{@app_path}/tmp/unicorn.pid"

# Set the path of the log files inside the log folder of the testapp
stderr_path "#{@app_path}/log/unicorn.stderr.log"
stdout_path "#{@app_path}/log/unicorn.stdout.log"
