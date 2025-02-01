import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { useApi } from "hooks/useApi";
import { useSession } from "next-auth/react";
import { findSelectedOption } from "utils/utils";
import { Select } from "components/UI";
import { useHandleMessage } from "hooks";

const Index = () => {
    const { t } = useTranslation("common");
    const handleMessage = useHandleMessage();

    const { data: session, update, status } = useSession()
    const { data: towers = [], isLoading } = useApi(`/towers?for_select=true`, {
        dedupingInterval: 10000,
    });

    const selectedTowerOption = findSelectedOption(towers, session?.user?.tower_id);

    const handleTowerChange = async (value) => {
        try {
            await update({
                ...session, user: {
                    ...session.user,
                    tower_id: value.id,
                }
            })
            handleMessage("tower changed successfully", "success");

        } catch (error) {
            handleMessage(error);

        }
    }
    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("settings_key")}
                    path="/settings"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">

                        <Select
                            label={t("tower_key")}
                            options={towers}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                            value={selectedTowerOption}
                            isLoading={isLoading || status == "loading"}
                            onChange={handleTowerChange}
                        />
                    </div>
                </div>
            </div>

        </>
    );
};

Index.getLayout = function PageLayout(page) {
    return (
        <Layout>
            <LayoutWithSidebar>{page}</LayoutWithSidebar>
        </Layout>
    );
};

export const getServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default Index;