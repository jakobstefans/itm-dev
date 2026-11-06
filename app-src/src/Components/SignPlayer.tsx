import YouTube from 'react-youtube'
import './SignPlayer.css'
import { useEffect, useRef, useState } from 'react'

const isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1

export function SignPlayer(props: any) {
    // const playVideo = () => {
    //     if (target) {
    //         target.playVideo()
    //     } else {
    //         setTimeout(() => {
    //             playVideo()
    //         }, 50)
    //     }
    // }

    const [playerReady, setPlayerReady] = useState(false)
    const [playerReadyCount, setPlayerReadyCount] = useState(0)
    const [showThumbnail, setShowThumbnail] = useState(true)
    const [target, setTarget] = useState()
    const [videoError, setVideoError] = useState<string | null>(null)

    // If YouTube never loads (e.g. blocked by a school web filter or no
    // internet), tell the user instead of showing a spinner forever.
    useEffect(() => {
        setVideoError(null)
    }, [props.videoId])
    useEffect(() => {
        if (target) {
            // Player loaded; drop a "couldn't load" message, keep real errors.
            setVideoError((current) => (current === 'timeout' ? null : current))
            return
        }
        const timeout = setTimeout(() => {
            setVideoError((current) => current ?? 'timeout')
        }, 20000)
        return () => clearTimeout(timeout)
    }, [props.videoId, target])

    const playerRef = useRef()

    const hiResUrl = `https://i.ytimg.com/vi/${props.videoId}/maxresdefault.jpg`
    const mdResUrl = `https://i.ytimg.com/vi/${props.videoId}/mqdefault.jpg`
    const altUrl = `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`
    const [thumbnailUrl, setThumbnailUrl] = useState(hiResUrl)

    const playVideo = () => {
        if (!target) return
        if (isSafari) {
            target.playVideo()
            setShowThumbnail(false)
        } else {
            setShowThumbnail(false)
            target.playVideo()
        }
        // playerRef?.focus()
        // document.getElementById(target.g).focus()
        // console.log(target)
    }

    // src={`https://i.ytimg.com/vi/${props.videoId}/maxresdefault.jpg`}
    // src={`https://img.youtube.com/vi/${props.videoId}/maxresdefault.jpg`}

    const opts = {
        // height: '390',
        // width: '640',
        width: '853',
        height: '480',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            // autoplay: isSafari ? 0 : 1,
            modestbranding: 1,
            mute: 1,
            rel: 0,
            loop: 1,
            playlist: props.videoId,
            // playsinline: isSafari ? 0 : 1,
            controls: 1,
            // fullscreen: 1,
            // origin: 'https://odinndagur.github.io/itm-dev/',
            origin: window.location.pathname,
        },
    }
    return (
        <>
            {/* {target && (
                <button onClick={() => target.playVideo()}>Play?</button>
            )}
            {target && (
                <button onClick={() => target.pauseVideo()}>Pause?</button>
            )} */}
            <div
                className="video-container"
                // style={{ visibility: playerReady ? undefined : 'hidden' }}
            >
                <div className="video-responsive" style={{}}>
                    <YouTube
                        ref={playerRef}
                        // className="video-responsive"
                        iframeClassName="video-responsive"
                        {...props}
                        opts={opts}
                        onReady={(ev) => {
                            setTarget(ev.target)
                            setPlayerReady(true)
                            setPlayerReadyCount((count) => count + 1)
                        }}
                        onError={(ev: { data: number }) => {
                            console.error('YouTube error', ev?.data)
                            setVideoError(String(ev?.data ?? 'unknown'))
                        }}
                        style={{
                            visibility: showThumbnail ? 'hidden' : undefined,
                        }}
                        key={playerReady ? 'playerReady' : 'playerNotReady'}
                    />
                    <img
                        src={thumbnailUrl}
                        // src={`https://img.youtube.com/vi/${props.videoId}/maxresdefault.jpg`}
                        alt={`Myndband sem sýnir táknið ${props.title}`}
                        // onError={(ev) => (ev.target.src = altUrl)}

                        onLoadCapture={(ev) => {
                            if (ev.currentTarget.naturalHeight <= 90) {
                                setThumbnailUrl(altUrl)
                            } else {
                                setShowThumbnail(true)
                            }
                            // console.log('naturalwidth', ev.target.naturalHeight)
                        }}
                        onClick={playVideo}
                        style={{
                            objectFit: 'cover',
                            width: '100%',
                            // display: playerReadyCount >= 2 ? 'none' : undefined,
                            display: showThumbnail ? undefined : 'none',
                        }}
                    />
                    {showThumbnail && (
                        <span
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%,-50%)',
                                    msTransform: 'translate(-50%,-50%)',
                                    textAlign: 'center',
                                    fontSize: '8em',
                                    color: `rgba(255,255,255,${
                                        playerReadyCount > 1 ? '0.7' : '0.3'
                                    })`,
                                    cursor: 'pointer',
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Spila myndband: ${
                                    props.title ?? 'tákn'
                                }`}
                                aria-disabled={!target}
                                className="material-icons"
                                onClick={playVideo}
                                onKeyDown={(ev) => {
                                    if (ev.key === ' ' || ev.key === 'Enter') {
                                        ev.preventDefault()
                                        ev.stopPropagation()
                                        playVideo()
                                    }
                                }}
                            >
                                play_circle
                            </span>
                            <span
                                className="spin"
                                style={{
                                    display:
                                        playerReadyCount > 1
                                            ? 'none'
                                            : undefined,
                                    position: 'absolute',
                                    textAlign: 'center',
                                    fontSize: '8em',
                                    color: 'rgba(255,255,255,0.7)',
                                    cursor: 'pointer',
                                }}
                            ></span>
                        </span>
                    )}
                    {videoError && (
                        <div
                            role="alert"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                padding: '1em',
                                background: '#111',
                                zIndex: 2,
                                color: 'white',
                            }}
                        >
                            <p style={{ margin: '0 0 0.5em' }}>
                                {videoError === 'timeout'
                                    ? 'Ekki tókst að hlaða myndbandinu. Athugaðu nettenginguna — YouTube gæti verið lokað á þessu neti.'
                                    : 'Þetta myndband er ekki aðgengilegt.'}
                            </p>
                            <a
                                href={`https://www.youtube.com/watch?v=${props.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'white' }}
                            >
                                Opna á YouTube
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
// ?mute=1&rel=0&loop=1&playlist=${embedId}&controls=0&playsinline=0&modestbranding=1&origin=https://odinndagur.github.io/itm-dev/
