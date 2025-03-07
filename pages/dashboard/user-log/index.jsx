import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { DeleteModal, Header, Table, PrintView, ServerTable } from "components/global";
import { Actions, Button, MinimizedBox, Modal } from "components/UI";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { CheckCircleIcon, QuestionMarkCircleIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import moment from 'moment-timezone';
import { Filter } from "components/pages/user-log";

const Index = () => {
    const router = useRouter();
    const language = router.locale.toLowerCase();
    const date_format = language === "en" ? "DD-MM-YYYY (hh:mm-A)" : "DD-MM-YYYY (hh:mm-A)";
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);


    // ================== Query String ==================
    const page = Number(router.query.page) || 1; // Default to page 1
    const limit = Number(router.query.limit) || 10; // Default limit
    const { queryString, updateQuery } = useQueryString({
        page,
        limit,
    });

    // ================== Handlers for Pagination ==================
    const handlePageChange = (newPage) => {
        updateQuery("page", newPage);
    };

    const handlePerRowsChange = (rowsPerPage) => {
        updateQuery({ page: 1, limit: rowsPerPage });
    };
    // Fetch data using the API
    const { data = {}, isLoading, mutate } = useApi(`/user-log?${queryString}`);
    const { data: tableData = [], totalUserLogs } = data;

    // ================== Delete Logic ==================

    const [showDeleteModal, setShowDeleteModal] = useState({
        loading: false,
        isOpen: false,
        id: null
    });
    const { executeMutation } = useApiMutation(`/user-log`);

    const closeDeleteModal = () => {
        setShowDeleteModal({});
    };

    const handleDelete = async ({ id = null }) => {
        !id && setShowDeleteModal((prev) => ({ ...prev, loading: true }));
        try {
            await executeMutation("DELETE", { id: id || showDeleteModal.id });
            mutate();
            !id && closeDeleteModal();
        } catch (error) {
            handleMessage(error);
        } finally {
            !id && setShowDeleteModal((prev) => ({ ...prev, loading: false }));
        }
    };

    // ================== Table Columns ==================
    const columns = useMemo(
        () => [

            {
                name: t("user_key"),
                selector: (row) => row?.user?.user_name || "",
                sortable: true,
                width: "150px"
            },
            {
                name: t("email_key"),
                selector: (row) => row?.user?.email || "",
                sortable: true,
                width: "150px"
            },

            {
                name: t("page_key"),
                selector: (row) => row?.action.split(":")[0],
                sortable: true,
                width: "150px"
            },
            {
                name: t("action_key"),
                selector: (row) => row?.action.split(":")[1],
                sortable: true,
                width: "150px"
            },
            {
                name: t("status_key"),
                selector: (row) => row?.status,
                cell: (row) => {
                    return <p className={`text-sm ${row?.status ? "text-green-500" : "text-red-500"}`}>
                        {row?.status ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                    </p>
                },
                sortable: true,
                width: "150px"
            },
            {
                name: t("details_key"),
                selector: (row) => row?.details,
                sortable: true,
                width: "400px"
            },

            {
                name: t("created_at_key"),
                selector: (row) => row?.created_at,
                cell: (row) => moment(row?.created_at).format(date_format),
                sortable: true,
                width: "130px"
            },
            {
                name: t("updated_at_key"),
                selector: (row) => row?.updated_at,
                cell: (row) => moment(row?.updated_at).format(date_format),
                sortable: true,
                width: "130px"
            },
            {
                name: t("actions_key"),
                selector: (row) => row?.id,
                noExport: true,
                noPrint: true,
                cell: (row) => (
                    <div className="flex gap-2">
                        <Button
                            onClick={() =>
                                setShowDeleteModal({ isOpen: true, id: row?.id })
                            }

                            className="px-3 py-2 text-white bg-red-500 cursor-pointer hover:bg-red-600"
                        >
                            <TrashIcon width={22} />
                        </Button>
                    </div>
                ),
                sortable: false
            }
        ],
        [date_format, router, t]
    );

    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("user_log_key"), handleMessage);
        setTimeout(() => {
            setExportingExcel(false);
        }, 1000);
    };

    const exportPDF = useCallback(() => {
        if (printViewRef.current) {
            printViewRef.current.print();
        }
    }, [printViewRef.current]);

    return (
        <>
            <div className="">
                <Header
                    title={t("user_log_key")}
                    path="/dashboard/user-log"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox minimized={false}>
                    <Filter />
                </MinimizedBox>
                <ServerTable
                    columns={columns}
                    data={tableData || []}
                    handlePageChange={handlePageChange}
                    handlePerRowsChange={handlePerRowsChange}
                    progressPending={isLoading}
                    paginationTotalRows={totalUserLogs}
                    paginationPerPage={limit} // Use limit from router query
                    paginationDefaultPage={page} // Use page from router query
                    onRowDoubleClicked={(row) => handleDelete({ id: row?.id })}
                    actions={
                        <Actions
                            onClickPrint={exportPDF}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={t("user_log_key")}
                ref={printViewRef}
                data={tableData}
                columns={columns}
            />}
            {showDeleteModal?.isOpen && (
                <Modal
                    title={t("delete_key")}
                    show={showDeleteModal?.isOpen}
                    footer={false}
                    onClose={closeDeleteModal}
                >
                    <DeleteModal
                        showDeleteModal={showDeleteModal}
                        handleClose={closeDeleteModal}
                        handleDelete={handleDelete}
                    />
                </Modal>
            )}
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