from flask import Flask, render_template, request
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

tf = Stylizer(model_path='./models/cubist.model')
models = {'vii' : './models/composition_vii.model',
        'cubist' : './models/cubist.model',
        'feathers' : './models/feather.model',
        'la_muse' : './models/la_muse.model',
        'mosaic' : './models/mosaic.model',
        'scream' : './models/the_scream.model',
        'udnie' : './models/udnie.model',
        'wave' : './models/wave.model',
        }

with open('default.jpg', 'rb') as fin:
    default_img = base64.b64encode(fin.read())


def cache(fn):
    ''' function decorator to automate caching '''
    call_cache = {}
    def wrapper(*args):
        if args in call_cache:
            return call_cache[args]
        else:
            rv = fn(*args)
            call_cache[args] = rv
            return rv
    return wrapper


def _img_to_str(img):
    buf = StringIO()
    img.save(buf, format='JPEG')
    return base64.b64encode(buf.getvalue())


@cache
def _process(url):
    img = urllib2.urlopen(url)
    img_data = StringIO(img.read())

    img = tf.stylize(img_data)

    return _img_to_str(img)


@app.route("/")
def hello():
    args = request.args.to_dict()
    if 'model' in args and args['model'] in models:
        print 'reloading with model %s' % args['model']
        tf = Stylizer(model_path = models[args['model']])

    return render_template('main.html', models = models.keys())

@socketio.on_error()
def error_handle(e):
    print(request.event['message'])
    url_json = request.event['args'][0]
    emit('stylized', {'id' : url_json['id'],
                    'img' : default_img,
                    'position' : url_json['position'],})
    print "err: %s, emitted default" % url_json['id']


@socketio.on('change_model')
def init(model_name):
    if model_name not in models:
        emit('model %s not valid' % model_name)

    tf.reload(model_path = models['model_name'])
    emit('change_msg', '%s loaded' % model_name)


@socketio.on('style')
def stylize(url_json):
    img = _process(url_json['url'])
    emit('stylized', {'id' : url_json['id'],
                    'img' : img,
                    'position' : url_json['position'],})
    print 'emitted id: %s' % url_json['id']


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
