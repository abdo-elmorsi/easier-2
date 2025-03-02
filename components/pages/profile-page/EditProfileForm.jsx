import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { FileInput, Input, Button, Spinner } from "components/UI";
import { useHandleMessage, useInput } from "hooks";
import { convertImageToBase64, generateCloudinaryUrl } from "utils/utils";
import Image from "next/image";
import { useApiMutation } from "hooks/useApi";

const EditProfileForm = () => {
  const { t } = useTranslation("common");
  const { data: session, update, status } = useSession()
  const handleMessage = useHandleMessage();

  const { user_name: user_user_name, phone: user_phone, email: user_email, id, img: user_image, role } = session?.user || {};
  const user_name = useInput(user_user_name, "");
  const email = useInput(user_email, "email", true);
  const phone = useInput(user_phone, "");

  const [image, setImage] = useState("");


  const { executeMutation, isMutating } = useApiMutation(`/users`);
  const onSubmit = async (e) => {
    e.preventDefault();
    const user = {
      user_name: user_name.value,
      email: email.value,
      phone: phone.value,
    }

    try {
      const updated_user = await executeMutation('PUT', { id, ...user, ...(image ? { img: image } : {}) });
      handleMessage("updated_successfully_key", "success");

      await update({ ...session, user: { ...session.user, ...user, ...(image ? { img: updated_user.user.img } : {}) } })
    } catch (error) {
      handleMessage(error);
    }
  };

  const updateImage = async (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSizeMB = 2;


    if (file) {
      try {
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`${t("image_allowed_key")} (PNG, JPG, JPEG)`);
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`${t("max_image_size_key")} 2MB`);
        }
        const base64String = await convertImageToBase64(file);
        setImage(base64String)
      } catch (error) {
        handleMessage(error);
      }
    }
  }
  return (

    <form onSubmit={onSubmit} className="flex flex-col items-center justify-around gap-8 sm:m-5 lg:flex-row">
      <div className="mb-12 flex flex-col items-center justify-center">
        <FileInput
          name={user_user_name || 'user'}
          label={<div className="user__image-box relative h-32 w-32 shrink-0 cursor-pointer overflow-hidden rounded-full shadow-lg outline outline-1 outline-offset-4 outline-gray-400 sm:h-48 sm:w-48">
            {status !== 'loading' && <Image
              alt={user_user_name}
              src={image || generateCloudinaryUrl(user_image)}
              width={200}
              height={200}
              className="user__image block h-full w-full scale-105 object-cover object-center transition-all duration-500"
            />}
            <span className="user__edit translate-y-1/5 absolute  top-1/2 left-1/2 -translate-x-1/2 text-center text-sm text-white opacity-0 transition-all duration-500 md:text-lg">
              {t("change_your_image_key")}
            </span>
          </div>}
          className={"mb-8 "}
          onChange={updateImage}
        />
        <p
          className={`text-center text-xs sm:text-sm text-gray-500 ${image && image.size / (1024 * 1024) >= 3.1 ? "text-red-500" : ""
            }`}
        >
          {t("image_allowed_key")} (PNG, JPG, JPEG)
          <br />
          {t("max_image_size_key")}: 2MB
        </p>

      </div>

      <div className="w-full lg:w-2/5">
        <Input
          mandatory
          label={t("name_key")}
          {...user_name.bind}
          className={"w-full"}
        />
        <Input
          mandatory
          label={t("email_key")}
          {...email.bind}
          className={"w-full"}
        />
        <Input
          label={t("phone_key")}
          {...phone.bind}
          className={"w-full"}
        />
        <Button
          disabled={isMutating || !user_name.value}
          className="btn--primary mx-auto mt-6 flex w-full items-center justify-center"
          type="submit"
        >
          {isMutating ? (
            <>
              <Spinner className="mr-3 h-4 w-4 rtl:ml-3" />{" "}
              {t("loading_key")}
            </>
          ) : (
            t("save_key")
          )}
        </Button>
      </div>
    </form>

  );
};

export default EditProfileForm;