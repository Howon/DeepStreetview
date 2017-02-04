import thread
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
    TRANSFORM_SOCKET.emit("style", img)
    # emit("transformed", {
    #     "url": img['url'],
    #     "id": img['id']
    # })
    # emit("transformed", {
    #     "url": "https://www.aspcapetinsurance.com/media/1064/mountain-dog.jpg",
    #     "id": img['id']
    # })
    # TRANSFORM_SOCKET.wait_for_callbacks(2)

def relay_image_to_front_end(img):
    FRONT_END_SOCKET.emit("transformed", {
        # "url": "https://www.aspcapetinsurance.com/media/1064/mountain-dog.jpg",
        "url": 'data:image/jpeg;base64,{}'.format(img['img']),
        "id": img['id'],
        "position": img['position']
    })
    print "Received message from jibben "

TRANSFORM_SOCKET.on("stylized", relay_image_to_front_end)

# TRANSFORM_SOCKET.on("stylized", relay_image_to_front_end)
thread.start_new_thread(TRANSFORM_SOCKET.wait)

if __name__ == "__main__":
    FRONT_END_SOCKET.run(app, host="0.0.0.0", debug=True)
