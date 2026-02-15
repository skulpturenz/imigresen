/* eslint-disable import/namespace */
/* eslint-disable import/no-namespace */
import type { PixelData } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import { isPromise, spread } from "es-toolkit";

export const toBoundingBox = async (
	inferenceResult: tf.Tensor | tf.Tensor[],
	pixels:
		| PixelData
		| ImageData
		| HTMLImageElement
		| HTMLCanvasElement
		| HTMLVideoElement
		| ImageBitmap,
	topk = 500,
	iou = 0.5,
	score = 0.5,
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

	const transpose = (x: tf.Tensor | tf.Tensor[]) =>
		tf.tidy(() => {
			const raw = Array.isArray(x) ? x.at(0) : x;

			return raw?.squeeze().transpose() as tf.Tensor;
		});

	const getBoundingBoxes = (x: tf.Tensor) =>
		tf.tidy(() => {
			// Slice first 4 columns for [x, y, w, h]
			const boxes = x.slice([0, 0], [-1, 4]);

			// Slice remaining columns for class probabilities and find the max score per box
			const classScores = x.slice([0, 4], [-1, -1]);
			const scores = classScores.max(1);
			const classIds = classScores.argMax(1);

			return [boxes, scores, classIds];
		});

	const filter =
		(topk: number, iou: number, score: number) =>
		async (boxes: tf.Tensor, scores: tf.Tensor, classIds: tf.Tensor) => {
			const nmsIndices = await tf.image.nonMaxSuppressionAsync(
				/// @ts-expect-error: type error only
				boxes,
				scores,
				topk,
				iou,
				score,
			);

			const filtered = await nmsIndices.array();

			return [filtered, boxes, scores, classIds];
		};

	const scaleBoundingBoxes = async (
		filteredResult: number[],
		boxes: tf.Tensor,
		scores: tf.Tensor,
		classIds: tf.Tensor,
	) =>
		await Promise.all(
			filteredResult.map(async idx => {
				const MODEL_DIMS = 640;

				const box = await boxes.slice([idx, 0], [1, 4]).data();
				const score = (await scores.slice([idx], [1]).data())[0];
				const classId = (await classIds.slice([idx], [1]).data())[0];

				// 1. YOLOv8 typically outputs [center_x, center_y, width, height]
				// If your boxes are appearing shifted, use this conversion:
				const [cx, cy, w, h] = box;
				const left = cx - w / 2;
				const top = cy - h / 2;

				// 2. Calculate scaling factors (Model 640 -> Canvas display size)
				const scaleX = pixels.width / MODEL_DIMS;
				const scaleY = pixels.height / MODEL_DIMS;

				return {
					box: {
						left: left * scaleX,
						top: top * scaleY,
						width: w * scaleX,
						height: h * scaleY,
					},
					score,
					classId,
				};
			}),
		);

	const pipeline = pipe(
		transpose,
		getBoundingBoxes,
		spread(filter(topk, iou, score)),
		spread(scaleBoundingBoxes),
	);

	return await pipeline(inferenceResult);
};
