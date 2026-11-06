import { useState, useEffect, Suspense } from 'react'
import { ThemeContext } from './Components/ThemeContext'
import SignPage from './Components/SignPage'
import HomePage from './Components/Home'
import {
    query,
    getSignByPhrase,
    getSignByIdJson,
    searchPagedCollectionById,
    getUserById,
    getRandomSign,
    searchPagedCollectionByIdRefactor,
    listHandforms,
} from './db'
import {
    ReactLocation,
    Router,
    Outlet,
    Navigate,
} from '@tanstack/react-location'

import PlaceholderScreen from './Components/PlaceholderScreen'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppNavBar } from './Components/AppNavBar'
import { Handform } from './Components/Handform'
import { DarkModeSwitch } from './Components/DarkModeSwitch'
import { NotFound } from './Components/NotFound'
import SignWikiCredits from './Components/SignWikiCredits'
import { CollectionsPage } from './Components/CollectionsPage'
import { RandomSign } from './Components/RandomSign'
import { SignCollectionPage } from './Components/SignCollectionPage'
import { MyLocationGenerics } from './Components/Generics'
import { RawSql } from './Components/RawSql'
import { GetCollections } from './Components/GetCollections'

const reactLocation = new ReactLocation()

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // staleTime: 1000 * 60 * 5,
            networkMode: 'offlineFirst',
        },
    },
})

function App() {
    const [promiseWorkerLoaded, setPromiseWorkerLoaded] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [currentTheme, setCurrentTheme] = useState(
        window.localStorage.getItem('theme_mode') ?? 'light'
    )
    useEffect(() => {
        // The worker answers once the database is ready (the first visit
        // builds it, which can take a while), or rejects if loading failed.
        query('select * from sign limit 5')
            .then((res: any) => {
                if (res && res[0]) {
                    setPromiseWorkerLoaded(true)
                } else {
                    setLoadError('Orðabókin er tóm.')
                }
            })
            .catch((error: any) => {
                console.error(error)
                setLoadError(String(error?.message || error || 'Óþekkt villa'))
            })
    }, [])

    if (loadError !== null) {
        return (
            <div role="alert" style={{ padding: '2em', textAlign: 'center' }}>
                <h1>Ekki tókst að hlaða orðabókinni</h1>
                <p>
                    Athugaðu nettenginguna og reyndu aftur. Ef vandinn heldur
                    áfram, prófaðu annan vafra.
                </p>
                <button onClick={() => window.location.reload()}>
                    Reyna aftur
                </button>
                <details style={{ marginTop: '1em' }}>
                    <summary>Tæknilegar upplýsingar</summary>
                    <code>{loadError}</code>
                </details>
            </div>
        )
    }

    if (!promiseWorkerLoaded) {
        return (
            <div role="status" aria-live="polite">
                <PlaceholderScreen />
                <p style={{ textAlign: 'center' }}>
                    Hleð orðabók… Fyrsta skiptið getur tekið smá stund.
                </p>
            </div>
        )
    }
    return (
        <Suspense>
            <QueryClientProvider client={queryClient}>
                <ThemeContext.Provider value={currentTheme}>
                    <Router
                        location={reactLocation}
                        basepath="itm-dev"
                        // defaultLinkPreloadMaxAge={Infinity}
                        // defaultPendingElement={<PlaceholderScreen />}
                        // defaultLoaderMaxAge={Infinity}
                        routes={[
                            {
                                path: '/',
                                element: (
                                    <Navigate
                                        to={'collection'}
                                        search={{ id: 1 }}
                                    />
                                ),

                                // loader: async ({ search }) => ({
                                //     signs: await searchPagedCollectionById({
                                //         searchValue: search.query ?? '',
                                //         collectionId: search.collection ?? 1,
                                //         page: search.page ?? 1,
                                //     }),
                                // }),
                            },
                            {
                                path: 'home',
                                element: <HomePage />,
                            },
                            {
                                path: 'collection',
                                children: [
                                    {
                                        //search: (search) => 'id' in search,
                                        element: <SignCollectionPage />,
                                        loader: async ({
                                            search,
                                        }: {
                                            search: MyLocationGenerics['Search']
                                        }) => ({
                                            signCollection:
                                                await searchPagedCollectionByIdRefactor(
                                                    {
                                                        collectionId:
                                                            search.id ?? 1,
                                                        page: search.page ?? 1,
                                                        searchValue:
                                                            search.query ?? '',
                                                        orderBy:
                                                            search.orderBy ?? {
                                                                value: 'az',
                                                                order: 'asc',
                                                            },
                                                    }
                                                ),
                                            user: await queryClient.fetchQuery({
                                                queryFn: () => getUserById(3),
                                                queryKey: ['user'],
                                            }),
                                            handforms: await listHandforms(),
                                        }),
                                        loaderMaxAge: 0,
                                    },
                                ],
                            },
                            { path: 'handforms', element: <Handform /> },
                            {
                                path: 'random',
                                element: <RandomSign />,
                                // element: async () =>
                                //     getRandomSign().then((signId) => (
                                //         <Navigate
                                //             to={`/signs/${signId}`}
                                //             key={signId}
                                //         />
                                //     )),
                                // loaderMaxAge: 0,

                                loader: async () => ({
                                    sign: await getSignByIdJson(
                                        await getRandomSign()
                                    ),
                                }),
                            },
                            {
                                path: 'signs',
                                children: [
                                    {
                                        path: '/',
                                        element: <SignCollectionPage />,
                                        loader: async ({
                                            search,
                                        }: {
                                            search: MyLocationGenerics['Search']
                                        }) => ({
                                            signCollection:
                                                await searchPagedCollectionByIdRefactor(
                                                    {
                                                        collectionId:
                                                            search.id ?? 1,
                                                        page: search.page ?? 1,
                                                        searchValue:
                                                            search.query ?? '',
                                                        orderBy:
                                                            search.orderBy ?? {
                                                                value: 'az',
                                                                order: 'asc',
                                                            },
                                                    }
                                                ),
                                            user: await getUserById(3),
                                        }),
                                        loaderMaxAge: 0,
                                    },
                                    {
                                        path: 'phrase',
                                        children: [
                                            {
                                                path: ':phrase',
                                                element: <SignPage />,
                                                loader: async ({ params }) => ({
                                                    sign: await getSignByPhrase(
                                                        decodeURIComponent(
                                                            params.phrase
                                                        )
                                                    ),
                                                    user: await getUserById(3),
                                                }),
                                            },
                                        ],
                                    },
                                    {
                                        path: ':id',
                                        element: <SignPage />,
                                        loader: async ({ params }) => ({
                                            sign: await getSignByIdJson(
                                                Number(params.id)
                                            ),
                                            user: await getUserById(3),
                                        }),
                                    },
                                ],
                            },
                            {
                                path: 'sign',
                                id: 'signByPhrase',
                                element: <SignPage />,
                                search: (search) => {
                                    return 'phrase' in search
                                },
                                loader: async ({ search }) => ({
                                    sign: await getSignByPhrase(
                                        String(search.phrase)
                                    ),
                                    user: await getUserById(3),
                                }),
                            },
                            {
                                path: 'sign',
                                id: 'signById',
                                element: <SignPage />,
                                search: (search) => {
                                    return 'id' in search
                                },
                                loader: async ({ search }) => ({
                                    sign: await getSignByIdJson(search.id),
                                    user: await getUserById(3),
                                }),
                            },
                            // {
                            //     path: 'settings',
                            //     element: <SettingsPage />,
                            //     loader: async () => ({
                            //         user: await getUserById(3),
                            //     }),
                            // },
                            {
                                path: 'settings',

                                element: <CollectionsPage />,
                                loader: async () => ({
                                    user: await getUserById(3),
                                }),
                                loaderMaxAge: 0,
                            },
                            {
                                path: 'leit',
                                element: <SignCollectionPage />,
                                loader: async ({ search }) => ({
                                    signCollection:
                                        await searchPagedCollectionById({
                                            collectionId:
                                                Number(search.id) ?? 1,
                                            page: Number(search.page) ?? 1,
                                            searchValue:
                                                String(search.query) ?? '',
                                        }),
                                    user: await getUserById(3),
                                }),
                                loaderMaxAge: 0,
                            },
                            {
                                path: 'sql',
                                element: <RawSql />,
                            },
                            {
                                path: 'default-collections',
                                element: <GetCollections />,
                            },
                            {
                                // Passing no route is equivalent to passing `path: '*'`
                                element: <NotFound />,
                            },
                        ]}
                    >
                        <Outlet />
                        <AppNavBar type="footer" />
                        <div
                            className="dark-mode-switch-container"
                            style={{
                                position: 'fixed',
                                top: 'env(safe-area-inset-top)',
                                right: '0',
                                padding: '1rem',
                                zIndex: 9999,
                            }}
                        >
                            <DarkModeSwitch setCurrentTheme={setCurrentTheme} />
                            {/* <ReactLocationDevtools /> */}
                        </div>
                    </Router>
                    <SignWikiCredits />
                </ThemeContext.Provider>
            </QueryClientProvider>
        </Suspense>
    )
}

export default App
