import React, { useEffect, useState } from 'react';
import styles from '../styles/login.module.css';
import { MdEmail } from 'react-icons/md';
import { BiSolidLock } from 'react-icons/bi';
import Image from 'next/image';
import { search_students } from '../utils/API_Calls/search';
import '../app/(landing)/globals.css';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Dog from '@/components/Dog';
// import ThemeButton from "@/components/Theme";
import Clear from '@/components/clear';
import { handleLog } from '../utils/API_Calls/login_api';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import { IoEye } from 'react-icons/io5';
import ReCAPTCHA from 'react-google-recaptcha';
import RetrivePassButton from '@/components/retrivePass';

const LoginPage: React.FC = () => {
  const [data, setData] = useState({ id: '', password: '' });
  const [pass, setPass] = useState('password');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const CAPTCHA_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY ||'';

  const router = useRouter();
  const toast = useToast();

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleLog_api = async () => {
    // Verify reCAPTCHA before proceeding
    if (!recaptchaToken) {
      console.log('reCAPTCHA not verified');
      alert('Please complete the reCAPTCHA verification');
      return;
    }
    sessionStorage.setItem('data', JSON.stringify(data));
    const status = await handleLog(data, recaptchaToken);

    if (status.success) {
      router.push(`/dashboard`);
    } else {
      toast({
        title: status.credentialError
          ? 'Wrong Credentials!!'
          : 'Server Error in Logging, Contact Developers',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  useEffect(() => {
    toast.closeAll();
    sessionStorage.clear();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    // console.log(data);
  };

  const handleEye = () => {
    if (pass === 'password') setPass('text');
    else setPass('password');
  };

  useEffect(() => {
    search_students('');
  }, []);

  return (
    <div>
      <Clear />
      <div className={styles['login-box']}>
        <div className={styles['login-box2']}>
          <Dog />
          <div className={styles['login-container']}>
            <h1 className={styles['login-title']} style={{ color: 'black' }}>
              Login
            </h1>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={styles['login-form-group']}
            >
              <MdEmail size={18} />

              <input
                className={styles['login-input']}
                type="text"
                name="id"
                value={data.id}
                onChange={handleSubmit}
                required
                placeholder="Roll Number"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={styles['login-form-group']}
            >
              <BiSolidLock size={18} />
              <input
                className={styles['login-input']}
                type={pass}
                name="password"
                value={data.password}
                onChange={handleSubmit}
                required
                placeholder="Password"
              />
              <IoEye size={18} onClick={handleEye} />
            </motion.div>
            <RetrivePassButton id={data.id} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <ReCAPTCHA
                sitekey={CAPTCHA_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>

            <div className={styles['login-bottom']}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href={'/register'}
                  className={styles['login-submit-button']}
                  style={{ color: 'black' }}
                >
                  Register
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={styles['login-submit-button']}
                onClick={handleLog_api}
                style={{ color: 'black' }}
                // style={{ color: "black" }}
              >
                Login
              </motion.div>
            </div>
          </div>
          {/* <Link href={'/'} className={styles["close-button"]}>
            &times;
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
