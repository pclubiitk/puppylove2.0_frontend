import Clear from '@/components/clear';
import ProfileSection from '@/app/(landing)/components/dashboard/profileSection';
import { Stack, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import styles from '@/styles/dashboard.module.css';
import NewSection from '@/app/(landing)/components/dashboard/newSection';
import MainSection from '@/app/(landing)/components/dashboard/mainSection';
import { Id, receiverIds, receiverSongs,setUser, Submit, user } from '@/utils/UserData';
import { Student, search_students } from '@/utils/API_Calls/search';
import { useEffect, useState } from 'react';
import { fetchUserData } from '@/utils/API_Calls/login_api';
import { useRouter } from 'next/router';
import { SendHeart } from '@/utils/API_Calls/Send_Heart';
import { fetchAccessToken,getRefreshToken } from '@/utils/API_Calls/spotify_Auth';

const dashboard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newDatafetched, setNewDataFetched] = useState(false);
  const [clickedStudents, setClickedStudents] = useState<Student[]>([]);
  const [hearts_submitted, set_hearts_submitted] = useState(Submit);

  const [isModalOpen, setModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [selectedSongIds, setSelectedSongIds] = useState<{ [key: string]: string | null }>({});
  const clientId = process.env.CLIENT_ID;
  const redirectUri = 'http://localhost:3000/dashboard';
  const scope = '';  

  const router = useRouter();
  const toast = useToast();

  // Fetch user data
  useEffect(() => {
    toast.closeAll();
    const fetchData = async () => {
      try {
        // console.log('Fetching user data..., before data: ' + receiverIds);
        setIsLoading(true);
        const result = await fetchUserData();
        if (result.success) {
          // Heart Sending Period Over, Now user is doing last day login to give Confirmation for Matching or to see Results(later)
          if (!result.permit) {
            if (!result.publish) {
              router.push(`/confirmation`);
            } else {
              router.push(`/result`);
            }
          }
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        router.push('/login');
        toast({
          title: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsLoading(false);
        setNewDataFetched(true);
      }
    };
    fetchData(); // Call the async function // select the students after the data is fetched
  }, []);

  // update the user Id once the data is fetched.
  useEffect(() => {
    const wait = async () => {
      if (Id != '') {
        setUser(search_students(Id)[0]);
      }
    };
    wait();
  }, [Id]);

//spotify
  const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; //55 minutes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    const checkAndRefreshToken = async () => {
      const storedExpiryTime = localStorage.getItem("token_expiry");
      const storedToken = localStorage.getItem("access_token");

      if (storedExpiryTime && storedToken) {
        const now = Date.now();
        if (now >= parseInt(storedExpiryTime)) {
          console.log("Token expired, refreshing...");
          await getRefreshToken(clientId!, scope, redirectUri, setAccessToken);
        } else {
          console.log("Token is still valid.");
          setAccessToken(storedToken);
        }
      } 
      // else {
      //   console.log("No token found, initiating authorization...");
      //   handleAuthorization(clientId!, scope, redirectUri);
      // }
    };

    if (code) {
      // Exchange authorization code for an access token
      fetchAccessToken(code, clientId!, redirectUri, setAccessToken);
    } else {
      // Check and refresh token periodically
      checkAndRefreshToken();
      const refreshTokenInterval = setInterval(() => {
        checkAndRefreshToken();
      }, TOKEN_REFRESH_INTERVAL);

      return () => clearInterval(refreshTokenInterval); // Clear interval on component unmount
    }
  }, [clientId, scope, redirectUri, setAccessToken]);

  // once the data is fetched, select the students and songs from the receiverIds and receiverSongs
  useEffect(() => {
    const fetchAndSelectStudents = () => {
      const selected: Student[] = [];
      const updatedSongIds: { [key: string]: string | null } = {};
      for (let i = 0; i < 4; i++) {
        const id = receiverIds[i];
         const songId = receiverSongs[i] || ''; 
        updatedSongIds[id] = songId;
        if (id === '') {
          continue;
        }
        const data = search_students(id);
        if (data == undefined) {
          return;
        }
        const student = data[0];
        if (student) {
          selected.push(student);
        }
      }
      setClickedStudents([...clickedStudents, ...selected]);
      setSelectedSongIds((prevSongIds) => ({...prevSongIds,...updatedSongIds,}));
    };
    fetchAndSelectStudents();
  }, [newDatafetched]);

  // sent heart api function
  const SendHeart_api = async (Submit: boolean) => {
    if (hearts_submitted) {
      return;
    }
    if (Submit) {
      set_hearts_submitted(true);
    }
    const selectedSongsData: { [key: string]: string | null } = {};
    for (let j = 0; j < clickedStudents.length; j++) {
      const id: string = clickedStudents[j].i;
      receiverIds[j] = id;
      selectedSongsData[id] = selectedSongIds[id] || null;
    }
    for (let j = clickedStudents.length; j < 4; j++) {
      receiverIds[j] = '';
      selectedSongsData[receiverIds[j]] = null;
    }
    const isValid = await SendHeart(Id, receiverIds,selectedSongsData, Submit);
    if (isValid && Submit) {
      toast({
        title: 'HEARTS SENT',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else if (!isValid && Submit) {
      toast({
        title: 'Error occurred , Hearts not sent',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } else if (!isValid && !Submit) {
      toast({
        title: 'Choices not saved',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const submit = async () => {
    await SendHeart_api(true);
    toast.closeAll();
  };
 

  return (
    <VStack
      className={styles.box}
      backgroundImage={useColorModeValue(
        'url(/bglight.png)', // Light theme image
        'url(/bgdark.jpg)' // Dark theme image
      )}
      backgroundSize={{ base: 'none', md: 'cover' }}
    >
      <Clear />
      <Stack
        direction={{ base: 'column', md: 'row' }}
        className={styles.dashboard}
      >
                     
        <ProfileSection
          user={user}
          submit={submit}
          submitted={hearts_submitted}
        />
        <MainSection
          clickedStudents={clickedStudents}
          setClickedStudents={setClickedStudents}
          hearts_submitted={hearts_submitted}
          set_hearts_submitted={set_hearts_submitted}
          SendHeart_api={SendHeart_api}
          selectedSongIds={selectedSongIds}
          setSelectedSongIds={setSelectedSongIds}

        />
        <NewSection />
      </Stack>
      <Clear />
    </VStack>
  );
};

export default dashboard;
