import { Box, useToast } from '@chakra-ui/react';
import styles from '../../../../styles/dashboard.module.css';
import { useEffect, useState } from 'react';
import { search_students, Student } from '@/utils/API_Calls/search';
import { BsSearch } from 'react-icons/bs';
import { Id, Submit } from '@/utils/UserData';
import Card from '@/components/card';
import LockAndHeart from './lockAndHeart';

const SERVER_IP = process.env.SERVER_IP;

interface mainSection {
  clickedStudents: Student[];
  setClickedStudents: Function;
  hearts_submitted: boolean;
  set_hearts_submitted: Function;
  SendHeart_api: Function;
  selectedSongIds: { [key: string]: string | null };
  setSelectedSongIds: Function;
}

const MainSection: React.FC<mainSection> = ({
  clickedStudents,
  setClickedStudents,
  hearts_submitted,
  set_hearts_submitted,
  SendHeart_api,
  selectedSongIds,
  setSelectedSongIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    set_hearts_submitted(Submit);
  }, [Submit]);

  useEffect(() => {
    fetchStudents();
  }, [searchQuery]);

  // select button click
  const handleButtonClick = async (studentRoll: string) => {
    if (clickedStudents.length >= 4) {
      toast({
        title: 'You cannot select more than 4 students',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const student = students.find((s) => s.i === studentRoll);

    if (student && !clickedStudents.find((s) => s.i === studentRoll)) {
      setClickedStudents([...clickedStudents, student]);
    } else {
      toast({
        title: 'This student has already been clicked!',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchStudents = () => {
    if (searchQuery === '') {
      setStudents([]);
      return;
    }
    const studentData = search_students(searchQuery);
    if (studentData == undefined) {
      // console.log("Not able to Fetch Students");
      return;
    }
    setStudents(studentData);
  };

  // on update the clickedStudents, send the hearts
  useEffect(() => {
    const updateVirtualHeart = async () => {
      // console.log(clickedStudents)
      // if (clickedStudents.length) {
      //   await SendHeart_api(false);
      // }
      await SendHeart_api(false);
    };

    if (clickedStudents.length >= 0) updateVirtualHeart();
  }, [clickedStudents,selectedSongIds]);

  // Fetch all active users
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`${SERVER_IP}/users/activeusers`, {
          method: 'GET',
          credentials: 'include', // For CORS
        });
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
        }
        const active = await res.json();
        setActiveUsers(active.users);
      } catch (err) {
        // Cannot fetch Active users
        console.log(err);
      }
    };

    fetchActiveUsers();
  }, []);

  const handleSongSelect = (studentId: string, songId: string | null) => {
    setSelectedSongIds((prev: any) => ({
      ...prev,
      [studentId]: songId,
    }));
  };

  const isActive = (id: string) => {
    return activeUsers.includes(id);
  };

  return (
    <Box
      width={{ base: '100%', md: '60%' }}
      _light={{ backgroundColor: 'rgba(141, 122, 122, 0.2)' }}
      className={styles.middleSection}
    >
      <LockAndHeart
        hearts_submitted={Submit}
        clickedStudents={clickedStudents}
        setClickedStudents={setClickedStudents} 
        selectedSongIds={selectedSongIds}   
        setSelectedSongIds={setSelectedSongIds}     
      />
      <Box className={styles.bottomMiddleSection}>
        <Box className={styles.searchDiv}>
          <BsSearch size={20} />
          <input
            type="text"
            className={styles.searchBar}
            placeholder="Enter Name To Search."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box className={styles.studentContainer}>
          {students.map(
            (student) =>
              student.i != Id && (
                <Card
                  key={student._id}
                  student={student}
                  onClick={handleButtonClick}
                  clickedCheck={clickedStudents.includes(student)}
                  isActive={isActive}
                  hearts_submitted={hearts_submitted}
                  setSelectedSongId={(songId: string | null) => handleSongSelect(student.i, songId)}
                  selectedSongId={selectedSongIds[student.i] || null}
                />
              )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MainSection;
