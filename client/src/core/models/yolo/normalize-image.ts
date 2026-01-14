/* eslint-disable import/namespace */
/* eslint-disable import/no-namespace */
import type { PixelData } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import { isPromise, partialRight } from "es-toolkit";

export const normalizeImage = async (
	pixels:
		| PixelData
		| ImageData
		| HTMLImageElement
		| HTMLCanvasElement
		| HTMLVideoElement
		| ImageBitmap,
) => {
	const pipe =
		(...fns: ((...args: any[]) => any)[]) =>
		(x: any) =>
			fns.reduce((y, fn) => {
				if (isPromise(y)) {
					return y.then(fn);
				}

				return fn(y);
			}, x);

	const toFloat = (tensor: tf.Tensor3D) => tensor.toFloat();

	const divide = (a: tf.Tensor, b: tf.Tensor | tf.TensorLike) => a.div(b);

	const expandDims = (a: tf.Tensor, axis: number) => a.expandDims(axis);

	const pipeline = pipe(
		tf.browser.fromPixelsAsync,
		toFloat,

		partialRight(divide, tf.scalar(255.0)),
		partialRight(expandDims, 0),
	);

	return await pipeline(pixels);
};
