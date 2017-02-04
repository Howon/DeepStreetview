from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from eventlet import monkey_patch
from cStringIO import StringIO
from socketIO_client import SocketIO as sio_client
import multiprocessing as mp
import base64
import urllib2
import json
import net

monkey_patch()

app = Flask(__name__)

app.config['q'] = mp.Queue()
app.config['p'] = None
app.config['cur_model'] = ''

socketio = SocketIO(app)

MID_IP = '160.39.244.52'

models = {'vii' : './models/composition_vii.model',
        'cubist' : './models/cubist.model',
        'feathers' : './models/feathers.model',
        'la_muse' : './models/la_muse.model',
        'mosaic' : './models/mosaic.model',
        'the_scream' : './models/the_scream.model',
        'udnie' : './models/udnie.model',
        'wave' : './models/wave.model',
        }

with open('default.jpg', 'rb') as fin:
    default_img = base64.b64encode(fin.read())

def processor(model_path, q, default_img, dest_ip):
    from net import Stylizer
    tf = Stylizer(model_path = model_path)

    OUT_SOCKET = sio_client(host=dest_ip, port=5000)

    cache = {}

    for url_json in iter(q.get, None):
        stuff = json.loads(url_json)
        if stuff['url'] in cache:
            img_str = cache[stuff['url']]
        else:
            try:
                img = urllib2.urlopen(stuff['url'])
                img_data = StringIO(img.read())

                img = tf.stylize(img_data)
                buf = StringIO()
                img.save(buf, format='JPEG')
                img_str = base64.b64encode(buf.getvalue())
            except:
                img_str = default_img

            cache[stuff['url']] = img_str

        OUT_SOCKET.emit('stylized', {'id' : stuff['id'],
                        'img' : img_str,
                        'position' : stuff['position'],
                        })
        print 'emitted id: %s' % stuff['id']


def _load_new(model_name):
    if model_name not in models:
        model_name='mosaic'

    if app.config['p'] is not None:
        app.config['q'].put(None)
        app.config['p'].join()

    app.config['cur_model'] = model_name
    print 'creating new process for %s' % model_name
    app.config['p'] = mp.Process(target=processor, args=(models[model_name], \
            app.config['q'], default_img, MID_IP))
    app.config['p'].start()


@socketio.on_error()
def error_handle(e):
    print(request.event['message'])
    print(request.event['args'])
    url_json = request.event['args'][0]
    emit('stylized', {'id' : url_json['id'],
                    'img' : default_img,
                    'position' : url_json['position'],})
    print "err: %s, emitted default" % url_json['id']


@socketio.on('style')
def stylize(url_json):
    print "rcvd from id: %s" % url_json['id']
    if (not app.config['cur_model']) or app.config['cur_model'] != url_json['style']:
        _load_new(url_json['style'])

    if app.config['p'] is None:
        app.config['p'] = mp.Process(target=processor, args= ('./models/mosaic.model', \
                app.config['q'], default_img, MID_IP))
        app.config['p'].start()

    app.config['q'].put(json.dumps(url_json))


@app.route("/")
def main():
    args = request.args.to_dict()
    if 'model' in args and args['model'] in models:
        print "/ %s" % args['model']
        _load_new(args['model'])

    return render_template('main.html', models = models.keys())

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
