import { handleLogin, handleLoginAsFlat } from "lib/controllers/auth-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";


const handler = async (req, res) => {
	const action = `login:${req.method}`;
	const asFlat = req.body?.asFlat;


	try {
		switch (req.method) {
			case "POST":
				!asFlat ? await handleLogin(req, res) : await handleLoginAsFlat(req, res);
				break;
			default:
				return res.status(405).json({ message: "Method Not Allowed" });
		}

		handleUserLogPostRequest({
			action,
			status: true,
			user_id: null,
			details: `${action} => User:${!req.body?.asFlat ? req.body?.email : `${req.body?.number}-${req.body?.floor}`} - Password:${req.body?.password}`,
		});


	} catch (error) {
		handleUserLogPostRequest({
			action,
			status: false,
			user_id: null,
			details: `${action} => User:${!req.body?.asFlat ? req.body?.email : `${req.body?.number}-${req.body?.floor}`} - Password:${req.body?.password} - Error: ${error?.message}`,
		});
		return res.status(400).json({ ...error, message: error?.message || "An unexpected error occurred." });
	}
};
export default handler;