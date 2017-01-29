import tensorflow as tf
import numpy as np
import scipy as sp
from scipy.misc import toimage
from PIL import Image
import argparse
import time

GIF = './zootopia/z-%s.png'
OUT = './zootopia/style/z-%s.png'

def parse_args():
    parser = argparse.ArgumentParser(description = "Render image using pretrained model.")
    parser.add_argument("--input", type = str, required = True)
    parser.add_argument("--output", type = str, default = "./out.gif")
    parser.add_argument("--model", type = str, required = True)
    parser.add_argument("--arch", type = str, default = "./models/model.meta")
    parser.add_argument("--shorten", action='store_true')
    args = parser.parse_args()
    return args

def process_frame(inputs, output, frame):
    image = np.expand_dims(frame, axis = 0)

    result = output.eval({inputs : image})
    result = np.clip(result, 0.0, 255.0).astype(np.uint8)
    result = np.squeeze(result, 0)

    styled = toimage(result, channel_axis=2)

    return styled

def get_frames(image):
    try:
        i = 0
        while True:
            image.seek(i)
            rgb = image.convert('RGB')
            yield sp.array(rgb).astype(np.float16)
            i += 1
    except EOFError:
        pass

def build_gif(frames, outpath, duration, shorten):
    if shorten:
        frames[0].save(outpath, save_all=True, append_images=frames[1:400], compress=True, duration=duration, loop=1000)
    else:
        frames[0].save(outpath, save_all=True, append_images=frames[1:], compress=True, duration=duration, loop=1000)

def run(session):
    args = parse_args()

    saver = tf.train.import_meta_graph(args.arch, clear_devices = True)
    saver.restore(session, args.model)
    inputs = tf.get_collection("inputs")[0]
    output = tf.get_collection("output")[0]

    gif = Image.open(args.input)
    styled = []

    print "Applying style..."
    t_s = time.time()

    for idx, frame in enumerate(get_frames(gif)):
        t = time.time()
        styled.append(process_frame(inputs, output, frame))

        t_end = time.time()

    t_e = time.time()

    print "%d frames processed. Average time used: " %idx, (t_e - t_s) / idx
    print "Building gif..."

    build_gif(styled, args.output, gif.info['duration'], args.shorten)

def main():
    session = tf.Session()
    with session.as_default():
        run(session)


if __name__ == "__main__":
    main()
