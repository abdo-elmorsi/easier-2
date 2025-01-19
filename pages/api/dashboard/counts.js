import { getCounts } from "lib/controllers/dashboard-controller";

const handler = async (req, res) => {
	try {
		switch (req.method) {
			case "GET":
				await getCounts(req, res);
				break;
			default:
				res.status(405).json({ message: "Method Not Allowed" });
		}
	} catch (error) {

		return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
	}
};
export default handler
