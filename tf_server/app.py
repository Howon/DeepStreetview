from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from eventlet import monkey_patch
from cStringIO import StringIO
import base64
import urllib2
import json
from net import Stylizer

monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app)

tf = Stylizer(model_path='./models/udnie.model')
models = {'vii' : './models/composition_vii.model',
        'cubist' : './models/cubist.model',
        'feathers' : './models/feather.model',
        'la_muse' : './models/la_muse.model',
        'mosaic' : './models/mosaic.model',
        'scream' : './models/the_scream.model',
        'udnie' : './models/udnie.model',
        'wave' : './models/wave.model',
        }

@app.route("/")
def hello():
    return 'Models: [%s]' % ','.join(models.keys())

@socketio.on('change_model')
def init(model_name):
    if model_name not in models:
        emit('model %s not valid' % model_name)

    tf.reload(model_path = models['model_name'])
    emit('change_msg', '%s loaded' % model_name)

def _img_to_str(img):
    buf = StringIO()
    img.save(buf, format='JPEG')
    return base64.b64encode(buf.getvalue())

@socketio.on('style')
def stylize(url):
    print url
    img_url = urllib2.urlopen(url)
    img_data = StringIO(img_url.read())

    img = tf.stylize(img_data)
    tf.save(img, 'test.jpg')

    img_str = _img_to_str(img)
    emit('stylized', img_str)
    print img_str

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=1337, debug=True)
