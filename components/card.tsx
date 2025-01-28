import React, { useEffect, useState } from 'react';
import '../styles/card.css';
import {Box,VStack,Text,IconButton,HStack,useColorMode,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody,ModalFooter,Button,useDisclosure,
} from '@chakra-ui/react';
import { FaHeart } from 'react-icons/fa';
import { TbMusicHeart } from 'react-icons/tb';
import { DeleteIcon } from '@chakra-ui/icons';
import SongSelector from './SongSelector';
const CustomCard = ({
  student,
  onClick,
  clickedCheck,
  isActive,
  hearts_submitted,
  inSelectSection,
  setSelectedSongId,
  selectedSongId,

}: any) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userName = student.u;
  const roll = student.i;

  const stylesss = {
    backgroundImage: `url("https://home.iitk.ac.in/~${userName}/dp"), url("https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${roll}_0.jpg"), url("/dummy.png")`,
  };
  const handleSongSelect = (SongId: string | null) => {
    setSelectedSongId((prevState: { [key: string]: string | null }) => ({
      ...prevState,
      [student.i]: SongId,
    }));
  };
  

  const isClicked = false;

  const clicked = () => {
    if (!isClicked) {
      onClick(student.i);
      clickedCheck = true;
    } else {
      alert('This student has already been clicked!');
    }
  };

  
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      className="card"
      p={4}
      borderRadius="md"
      boxShadow="md"
      bg={colorMode === 'light' ? '#FFFDE760' : '#12121260'}
      color={colorMode === 'light' ? '#333' : '#f2f2f2'}
      border="2px solid"
      borderColor={colorMode === 'light' ? '#FFD700' : '#ffffff60'}
    >
      <Box
        borderRadius="md"
        style={stylesss}
        className={`profile ${isActive(student.i) ? '' : 'inactive'}`}
      />
      <VStack align="start" spacing={2} ml={4} flex="1">
        <Text fontSize="lg" fontWeight="bold">
          {student.n}
        </Text>
        <Text fontSize="sm" color="gray.300">
          {'About info here, Hi i love to write and read poems'}
        </Text>

        <HStack justify="space-between" width="100%">
          {hearts_submitted && isActive(student.i) ? (
            <Text color="green.500">Hearts Submitted</Text>
          ) : isActive(student.i) ? (
            <HStack spacing={2}>
              {!inSelectSection && (
                <IconButton
                  border="1px solid"
                  borderColor={colorMode === 'light' ? '#FFD700' : '#ffffff60'}
                  aria-label="Add to favorite"
                  onClick={clicked}
                >
                  <FaHeart color="red" />
                </IconButton>
              )}
            {inSelectSection && (
              <IconButton
                border="1px solid"
                borderColor={colorMode === 'light' ? '#FFD700' : '#ffffff60'}
                color={colorMode == 'light' ? 'green.500' : 'green.300'}
                aria-label="Add to favorite with music"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent other event handlers from triggering
                  onOpen();
                }}
              >
                <TbMusicHeart />
              </IconButton>
            )}
              
              {inSelectSection && (
                <IconButton
                  border="1px solid"
                  borderColor={colorMode === 'light' ? '#FFD700' : '#ffffff60'}
                  color={'red.500'}
                  aria-label="Remove from selection"
                  onClick={clicked}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </HStack>
          ) : (
            <Text color="red.500">Not Active</Text>
          )}

        </HStack>
      </VStack>
       {/* Song Selector Modal */}
       <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent  
    maxHeight="80vh" 
    overflowY="auto" 
    borderRadius="10px"
    bg="rgba(0, 0, 0, 0.45)"
    boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    backdropFilter="blur(15.5px)"
   
    border="1px solid rgba(255, 255, 255, 0.18)"
    >
          <ModalHeader>Select a Song</ModalHeader>
          
          <ModalBody>
          {selectedSongId && (
    <Box textAlign="center" mb={4}>
      <Text fontSize="lg" fontWeight="bold" mb={2} color="white">
        Currently Selected
      </Text>
      <iframe
        src={`https://open.spotify.com/embed/track/${selectedSongId}`}
        width="100%"
        height="80"
        allow="autoplay; encrypted-media"
        style={{
          borderRadius: '12px',
        }}
      ></iframe>
    </Box>
  )}
       
            <SongSelector onConfirm={handleSongSelect} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomCard;
