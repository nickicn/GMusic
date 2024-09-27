import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { 
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet, 
    Text, 
    TouchableOpacity,
    View 
} from 'react-native'
import Slider from '@react-native-community/slider'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import songs from '../model/data'

    const { width, height } = Dimensions.get('window')

    const MusicPlayer = () => {
            const [sound, setSound] = useState(null);      
            const [songIndex, setSongIndex] = useState(0);
            const [songStatus, setSongStatus] = useState(null);
            const [isPlaying, setIsPlaying] = useState(false);

         const songSlider = useRef(null);   
         const scrollX = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            scrollX.addListener(({ value }) => {
                const index = Math.round(value / width);
                setSongIndex(index);
            });
        }, []);
  
  const renderSongs = ({ item, index }) => {
    return (
        <Animated.View style={styles.mainImageWrapper}>
            <View style={[styles.imageWrapper, styles.elevation]}>
                <Image source={item.artwork} style={styles.musicImage} />
            </View>
        </Animated.View>
    )
    }

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(songs[songIndex].url);
        setSound(sound);
        const status = await sound.getStatusAsync();
        setSongStatus(status);
        setIsPlaying(false);
    };

    useEffect(() => {
        if (sound){
            sound.unloadAsync();
        }
        loadSound();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [songIndex]);

    const skipToNext = () => {
        songSlider.current.scrollToOffset({
            offset: (songIndex + 1) * width
        });
    };

    const skipToPrevious = () => {
        songSlider.current.scrollToOffset({
            offset: (songIndex - 1) * width
    });
  };

    const handlePlayPause = async () => {
        if (isPlaying) {
            await pause();
        } else {
            await play();
        }
    };
    
    const play = async () => {
        if (sound) {
            setIsPlaying(true);
            await sound.playAsync();
        }
    }

    const stop = async () => {
        if (sound) {
            await sound.stopAsync();
            sound.unloadAsync();
            await loadSound();
        }
    }

    const pause = async () => {
        if (sound) {
            setIsPlaying(false);
            await sound.pauseAsync();
        }
    }
        const updatePosition = async () => {
            if (sound && isPlaying) {
                const status = await sound.getStatusAsync();
                setSongStatus(status);
                if (status.positionMillis == status.durationMillis) {
                    await stop();
                }
            }
        }

        useEffect(() => {
            const intervalId = setInterval(updatePosition, 500);
            return () => clearInterval(intervalId);
    }, [sound, isPlaying]);
    
     return (
    <SafeAreaView style={styles.container}>
        <View style={styles.main}>

        <Animated.FlatList
            ref={songSlider}        
            renderItem={renderSongs}
            data={songs}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
             [
                {
                    nativeEvent: {
                        contentOffset: {x: scrollX},
                    },
                },
             ],
             {useNativeDriver: true},
            )}
         />

        <View>
            <Text style={[styles.songContent, styles.songTitle]}>
                {songs[songIndex].title}
            </Text>
            <Text style={[styles.songContent, styles.songArtist]}>
                {songs[songIndex].artist}
            </Text>
        </View>

        <View>
            <Slider
                style={styles.progressBar}
                value={songStatus ? songStatus.positionMillis : 0}
                minimumValue={0}
                maximumValue={songStatus ? songStatus.durationMillis : 0}
                thumbTintColor='#FFD369'
                minimumTrackTintColor='#FFD369'
                maximumTrackTintColor='#FFF'
                onSlidingComplete={(value) => { 
                    sound.setPositionAsync(value)
                }}
            />
            <View style={styles.progressLevelDuration}>
                <Text style={styles.progressLabelText}>
                    {songStatus ?
                     (`${Math.floor(songStatus.positionMillis / 1000 / 60)}:${String(Math.floor(((songStatus.positionMillis / 1000) % 60))).padStart(2, "0")}`
                     ) : "00:00"
                    }
                </Text>
                <Text style={styles.progressLabelText}>
                    {songStatus ?
                     (`${Math.floor(songStatus.durationMillis / 1000 / 60)}:${String(Math.floor(((songStatus.durationMillis / 1000) % 60))).padStart(2, "0")}`
                     ) : "00:00"
                    }</Text>
            </View>
        </View>

        <View style={styles.musicControlContainer}>
            <TouchableOpacity onPress={skipToPrevious}>
                <Ionicons name='play-skip-back-outline' size={35} color="#FFD369" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePlayPause}>
                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={75} color="#FFD369" />
            </TouchableOpacity>
            <TouchableOpacity onPress={skipToNext}>
                <Ionicons name='play-skip-forward-outline' size={35} color="#FFD369" />
            </TouchableOpacity>
        </View>

        </View>
        <View style={styles.footer}>
            <View style={styles.iconWrapper}>
                <TouchableOpacity>
                    <Ionicons name='heart-outline' size={30} color="#888888" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name='repeat' size={30} color="#888888" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name='share-outline' size={30} color="#888888" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name='ellipsis-horizontal' size={30} color="#888888" />
                </TouchableOpacity>
            </View>
        </View>
      <StatusBar style='light'/>
    </SafeAreaView>
  )
  }

export default MusicPlayer

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222831',
    },
    main:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    mainImageWrapper: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: 340,
        height: 360,
        marginVertical: 20,
    },
    musicImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    songContent: {
        textAlign: 'center',
        color: '#EEEEEE'
    },
    songTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    songArtist: {
        fontSize: 16,
        fontWeight: '300',
    },
    progressBar: {
        width: 340,
        height: 40,
        marginTop: 20,
        flexDirection: 'row'
    },
    progressLevelDuration: {
        width: 340,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    progressLabelText: {
        color:'#fff',
        fontWeight: '500',
    },
    musicControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '60%',
         marginTop: 10,
    },
    footer: {
        width: width,
        alignItems: 'center',
        paddingVertical: 15,
        borderTopColor: '#393E45',
        borderWidth: 1
    },
    iconWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%'
    },
    elevation: {
        elevation: 5,
        shadowOffset: {
            width: 5,
            height: 5
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84
    }
})



















