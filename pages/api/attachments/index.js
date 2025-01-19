import { handleDeleteRequest, handleGetRequest } from "lib/controllers/attachments-controller";
import { handlePostRequest as handleUserLogPostRequest } from "lib/controllers/user-log-controller";
import { getToken } from "next-auth/jwt";

const handler = async (req, res) => {
  const action = `attachments:${req.method}`;

  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  req.user_id = token?.id;
  req.role = token?.role;

  try {

    switch (req.method) {
      case "GET":
        await handleGetRequest(req, res);
        break;
      case "DELETE":
        await handleDeleteRequest(req, res);
        break;
      default:
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // Log success for non-GET requests
    if (req.method !== "GET") {
      handleUserLogPostRequest({
        action,
        status: true,
        user_id: token?.id,
        details: `${action} => `,
      });
    }

  } catch (error) {
    handleUserLogPostRequest({
      action,
      status: false,
      user_id: token?.id,
      details: `statusCode:${error.statusCode || 500} message:${error?.message || "An unexpected error occurred."}`,
    });
    return res.status(error.statusCode || 500).json({ ...error, message: error?.message || "An unexpected error occurred." });
  }
};

export default handler;
