import { Stack, VStack, Box, useToast, Button, ring } from '@chakra-ui/react';
import styles from '@/styles/dashboard.module.css';
import { FaHeart, FaRandom, FaSpotify } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { handle_Logout } from '@/utils/API_Calls/login_api';
import ActionButton from './actionButton';
import { Student } from '@/utils/API_Calls/search';
const SERVER_IP = process.env.SERVER_IP;

import {
  EditablePreview,
  useColorModeValue,
  IconButton,
  Input,
  useEditableControls,
  ButtonGroup,
  Editable,
  Tooltip,
  EditableInput,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';

import SetRecoveryToast from './recoveryToast';
import IntrestChips from '@/components/intrestChips';
import { About, setAbout } from '@/utils/UserData';
import { handleAuthorization } from '@/utils/API_Calls/spotify_Auth';
interface profile {
  user: Student;
  submit: Function;
  submitted: boolean;
}

function EditableControls() {
  const { isEditing, getSubmitButtonProps, getCancelButtonProps } =
    useEditableControls();

  return isEditing ? (
    <ButtonGroup size="sm" ml={1} spacing={1}>
      <IconButton
        aria-label="Save"
        icon={<CheckIcon />}
        {...getSubmitButtonProps()}
      />
      <IconButton
        aria-label="Cancel"
        icon={<CloseIcon boxSize={3} />}
        {...getCancelButtonProps()}
      />
    </ButtonGroup>
  ) : null;
}
const ProfileSection: React.FC<profile> = ({ user, submit, submitted }) => {
  const router = useRouter();
  const toast = useToast();
  const [userAbout, setUserAbout] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    console.log(About);
    setUserAbout(About.length ? About : 'Tell us more about you!!');
  }, [About]);
  const clientId = process.env.CLIENT_ID;
  const redirectUri = 'http://localhost:3000/dashboard';
  const scope = '';  
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      setIsAuthorized(true);
    }
  }, []);
  const handleAuthorizationClick = () => {
    handleAuthorization(clientId!, scope, redirectUri);
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuthorized(true); 
    } else {
      console.error('Access token not found in local storage.');
    }
  };
  const Logout = async () => {
    // console.log(clickedStudents)
    // await SendHeart_api(false); // why?
    const isValid = await handle_Logout();
    router.push('/').then(() => {
      window.location.reload();
    });
    if (!isValid) {
      toast({
        title: 'Some error occured while Logging Out',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else {
      toast({
        title: 'Logged Out',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleToast = () => {
    toast({
      position: 'top',
      duration: null,
      isClosable: true,
      render: ({ onClose }) => (
        <Box bg="gray.100" borderRadius="md" p={4} textAlign="center">
          <p style={{ fontWeight: 'bold', color: 'black' }}>
            Are you sure you want to Submit?
          </p>
          <Button
            colorScheme="black"
            color="gray.800"
            bg="gray.300"
            onClick={onClose}
          >
            No
          </Button>
          <Button
            colorScheme="pink"
            ml={2}
            onClick={() => {
              submit();
            }}
          >
            Yes
          </Button>
        </Box>
      ),
    });
  };

  const stylesss = {
    backgroundImage: `url("https://home.iitk.ac.in/~${user?.u}/dp"), url("https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${user?.i}_0.jpg"), url("/dummy.png")`,
  };

  const updateAbout = async (about: string) => {
    try {
      if (about === '') {
        about = 'Tell us more about you!!';
        setUserAbout(about);
      }
      const res = await fetch(`${SERVER_IP}/users/about`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          about: about,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(`Error: ${res.status} - ${data.error}`);
        throw new Error('Some error occured, Try again later.');
      }
      toast({
        title: data.message,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom',
      });
      setAbout(about);
    } catch (err) {
      setAbout(About || 'Tell us more about you!!');
      toast({
        title: 'Some Error Occured, Try again later.',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  return (
    <Stack
      className={styles.profileSection}
      width={{ md: '22%' }}
      minWidth={{ md: '280px' }}
    >
      <Stack
        direction={{ base: 'row', md: 'column' }}
        alignItems={{ md: 'center' }}
        padding={{ base: '1%', md: '2%' }}
        style={{ margin: '1%', width: '100%', flexGrow: 1 }}
      >
        <div className={styles.dp} style={stylesss}></div>
        <VStack
          className={styles.infoSection}
          alignItems={'start'}
          width={'100%'}
        >
          <div style={{ width: '100%' }}>
            <p className={styles.infoLable}>Hello, its great to see you!!</p>
            <p className={styles.name}>{user?.n}</p>
          </div>
          <div style={{ width: '100%' }}>
            <p className={styles.infoLable}>How about you?</p>
            <Editable
              value={userAbout}
              isPreviewFocusable={true}
              selectAllOnFocus={false}
              className={styles.editAbout}
              onSubmit={updateAbout}
              onChange={(newValue) => setUserAbout(newValue)}
            >
              <EditablePreview
                _hover={{
                  background: useColorModeValue('#00000020', '#ffffff20'),
                }}
                _hidden={{ display: 'none' }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'right',
                }}
              >
                <Input
                  maxLength={50}
                  paddingLeft={0}
                  textAlign={'right'}
                  as={EditableInput}
                />
               
                <EditableControls />
              </div>
            </Editable>
          </div>

          <div style={{ width: '100%' }}>
            <p className={styles.infoLable}>You love to do?</p>
            <IntrestChips />
          </div>
        </VStack>
      </Stack>

      <Stack
        direction={{ base: 'row', md: 'column' }}
        className="action-section"
        justifyContent={{ base: 'right', md: 'center' }}
      >
      <Button
                            onClick={handleAuthorizationClick}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor:"#1DB954", 
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              padding: "10px 15px",
                              fontSize: "16px",
                              cursor: "pointer",
                              transition: "background-color 0.3s",
                              boxShadow: isAuthorized
                                ? "0px 4px 10px rgba(0, 0, 0, 0.2)"
                                : "0px 2px 5px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            {!isAuthorized ? (
                              <>
                                <FaSpotify style={{ marginRight: "8px" }} />Connect Spotify
                              </>
                            ) : (
                              <>
                                <FaSpotify style={{ marginRight: "8px" }} />Connected
                              </>
                            )}
      </Button>
        <ActionButton
          text={submitted ? 'Submitted' : 'Submit Hearts'}
          icon={<FaHeart />}
          onClick={submitted ? () => {} : handleToast}
        />
        <ActionButton
          text={'Random Search'}
          icon={<FaRandom />}
          onClick={() => {}}
        />
        <SetRecoveryToast />
        <ActionButton text={'LogOut'} icon={<BiLogOut />} onClick={Logout} />
      </Stack>
    </Stack>
  );
};

export default ProfileSection;
