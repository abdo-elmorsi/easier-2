import { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';



import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';

import NextNprogress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from 'components/layout/Layout';
import { CopyRights, ScrollToTopButton } from 'components/UI';

import debounce from 'utils/debounce';
import GlobalSetting from 'helper/settings/GlobalSetting';
import { ThemeProvider } from 'context/ThemeContext';

import 'styles/globals.scss';
import Head from 'next/head';
import { app_title } from 'assets';

const FONT_SIZE_BASE = 16;
const FONT_SIZE_RATIO = 0.04; // Ratio for responsive font size


const titleMap = {
  "/": { en: "Dashboard - Easier", ar: "لوحة التحكم - أسهل" },
  "/users": { en: "Users - Easier", ar: "المستخدمون - أسهل" },
  "/users/add-update": { en: "Add/Update User - Easier", ar: "إضافة/تعديل مستخدم - أسهل" },
  "/towers": { en: "Towers - Easier", ar: "الأبراج - أسهل" },
  "/towers/add-update": { en: "Add/Update Tower - Easier", ar: "إضافة/تعديل برج - أسهل" },
  "/flats": { en: "Flats - Easier", ar: "الشقق - أسهل" },
  "/flats/add-update": { en: "Add/Update Flat - Easier", ar: "إضافة/تعديل شقة - أسهل" },
  "/opening-balance": { en: "Opening Balance - Easier", ar: "الرصيد الافتتاحي - أسهل" },
  "/opening-balance/add-update": { en: "Add/Update Opening Balance - Easier", ar: "إضافة/تعديل الرصيد الافتتاحي - أسهل" },
  "/estimated-expenses": { en: "Estimated Expenses - Easier", ar: "المصروفات التقديرية - أسهل" },
  "/estimated-expenses/add-update": { en: "Add/Update Estimated Expenses - Easier", ar: "إضافة/تعديل المصروفات التقديرية - أسهل" },
  "/settlement": { en: "Settlement - Easier", ar: "التسوية - أسهل" },
  "/settlement/add-update": { en: "Add/Update Settlement - Easier", ar: "إضافة/تعديل التسوية - أسهل" },
  "/monthly-report": { en: "Monthly Report - Easier", ar: "التقرير الشهري - أسهل" },
  "/annually-report": { en: "Annually Report - Easier", ar: "التقرير السنوي - أسهل" },
  "/tower-balances": { en: "Tower Balances - Easier", ar: "أرصدة الأبراج - أسهل" },
  "/user-log": { en: "User Log - Easier", ar: "سجل المستخدم - أسهل" },
  "/profile": { en: "Profile - Easier", ar: "الملف الشخصي - أسهل" },
  "/settings": { en: "Settings - Easier", ar: "الإعدادات - أسهل" },
  "/login": { en: "Login - Easier", ar: "تسجيل الدخول - أسهل" },
};


function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { t } = useTranslation("common");


  // Handle dynamic font resizing based on window width
  const handleResize = useCallback(
    debounce(() => {
      const fontSize =
        window.innerWidth < 425
          ? `${(window.innerWidth * FONT_SIZE_RATIO).toFixed(1)}px`
          : `${FONT_SIZE_BASE}px`;
      document.documentElement.style.fontSize = fontSize;
    }, 100),
    []
  );

  // Setup event listeners for resize and orientation changes
  useEffect(() => {
    handleResize(); // Initial resize on component mount
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Handle RTL and LTR direction based on locale
  useEffect(() => {
    if (router.locale === 'ar') {
      document.documentElement.lang = 'ar';
      document.body.dir = 'rtl';
    } else {
      document.documentElement.lang = 'en';
      document.body.dir = 'ltr';
    }
  }, [router.locale]);



  // Custom layout for each page (if provided)
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <>
      <Head>
        <title>{titleMap[router.pathname]?.[router.locale] || "أسهل"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <SessionProvider
        refetchOnWindowFocus={false}
        session={pageProps.session}>

        <ThemeProvider>
          {/* Progress Bar */}
          <NextNprogress
            color="var(--primary)"
            startPosition={0.3}
            stopDelayMs={200}
            height={3}
            showOnShallow={true}
            showSpinner={false}
          />

          {/* Toast Notifications */}
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 99999 }}
          />

          {/* Global Settings */}
          <GlobalSetting>
            {getLayout(<Component {...pageProps} />)}
          </GlobalSetting>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />

          {/* Footer */}
          <CopyRights />

        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object.isRequired,
};

// Static props to load translations for each page
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default appWithTranslation(MyApp);
