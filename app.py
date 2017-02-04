from flask import Flask, render_template
from socketIO_client import SocketIO as socket_io_client

from flask_socketio import SocketIO, emit
from eventlet import monkey_patch

import requests

monkey_patch()

app = Flask(__name__)
app.config.from_pyfile('config/config.cfg')

FRONT_END_SOCKET = SocketIO(app)

TRANSFORM_SERVER_IP = "209.2.230.22"
TRANSFORM_SOCKET = socket_io_client(host=TRANSFORM_SERVER_IP, port=5000)

@app.route("/")
def hello():
    return render_template("index.html", api_key=app.config["STREETVIEW_API_KEY"])

@FRONT_END_SOCKET.on('transform')
def stylize(img):
    TRANSFORM_SOCKET.emit("style", img['url'])
    emit("transformed", {
        "url": img['url'],
        "id": img['id']
    })

def relay_image_to_front_end(*args):
    print "Received message from jibben " + str(args)

# TRANSFORM_SOCKET.on("stylized", relay_image_to_front_end)

if __name__ == "__main__":
    FRONT_END_SOCKET.run(app, host="0.0.0.0", debug=True)
