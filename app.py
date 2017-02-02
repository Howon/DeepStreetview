from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from eventlet import monkey_patch

monkey_patch()

app = Flask(__name__)
app.config.from_pyfile('config/config.cfg')
socketio = SocketIO(app)

@app.route("/")
def hello():
    return render_template("index.html", api_key=app.config["STREETVIEW_API_KEY"])

@socketio.on('req_style_transfer')
def stylize(img):
  print img

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", debug=True)
