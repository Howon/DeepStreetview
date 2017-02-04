import tensorflow as tf
import numpy as np
import scipy as sp
from scipy.misc import toimage
from PIL import Image
import argparse

class Stylizer(object):
    '''
    class to stylize an image using saved tf model
    '''

    def __init__(self, model_path, arch='./models/model.meta'):
        self.saver = tf.train.import_meta_graph(arch, clear_devices = True)
        self.session = tf.Session()
        with self.session.as_default():
            self.saver.restore(self.session, model_path)
            self.inputs = tf.get_collection("inputs")[0]
            self.output = tf.get_collection("output")[0]

    def _process_image(self, img):
        image = np.expand_dims(img, axis = 0)

        result = self.output.eval({self.inputs : image}, session=self.session)
        result = np.clip(result, 0.0, 255.0).astype(np.uint8)
        result = np.squeeze(result, 0)

        styled = toimage(result, channel_axis=2)

        return styled

    def stylize_file(self, img_path):
        img = Image.open(img_path)
        img = img.convert('RGB')

        return self._process_image(img)

    def stylize(self, img_file):
        img = Image.open(img_file)
        img = img.convert('RGB')

        return self._process_image(img)

    def save(self, img, outpath):
        img.save(outpath)


def parse_args():
    parser = argparse.ArgumentParser(description = "Render image using pretrained model.")
    parser.add_argument("--input", type = str, required = True)
    parser.add_argument("--output", type = str, default = "./out.jpg")
    parser.add_argument("--model", type = str, required = True)
    parser.add_argument("--arch", type = str, default = "./models/model.meta")
    args = parser.parse_args()
    return args

def main():
    args = parse_args()
    s = Stylizer(args.model, args.arch)
    img = s.stylize_path(args.input)
    s.save(img, args.output)

if __name__ == "__main__":
    main()
