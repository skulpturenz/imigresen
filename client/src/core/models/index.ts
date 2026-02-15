const v = (publicPath: string, version: Date) => {
	const searchParams = new URLSearchParams({
		version: `${version.getTime()}`,
	});

	return `${publicPath}?${searchParams.toString()}`;
};

export const models = {
	signverodAutomlEdge: v(
		"/models/signverod-automl-edge/model.json",
		new Date(2026, 0, 11, 0, 0, 0, 0),
	),
	yolov8sTfjs: v(
		"/models/yolov8s-tfjs/model.json",
		new Date(2026, 0, 13, 0, 0, 0, 0),
	),
};
