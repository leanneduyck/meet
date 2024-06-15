import { useEffect, useState, useCallback } from 'react';
// import { setCookie, getCookie } from './cookieUtils';
import CitySearch from './components/CitySearch';
import EventList from './components/EventList';
import NumberOfEvents from './components/NumberOfEvents';
import { InfoAlert, ErrorAlert } from './components/Alert';

import './App.css';
import spinningGlobe from './spinning_globe.gif';

import mockData from './mock-data';

// extracts the locations from the events
const extractLocations = (events) => {
  const extractedLocations = events.map((event) => event.location);
  const locations = [...new Set(extractedLocations)];
  return locations;
};

// gets events from the mockData file if the app is running locally, otherwise it will fetch the events from the Google Calendar API
const getEvents = async () => {
  if (window.location.href.startsWith('http://localhost')) {
    return mockData;
  } else {
    const accessToken = await getAccessToken();
    if (accessToken) {
      try {
        const url =
          'https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/get-events' +
          '/' +
          accessToken;
        const response = await fetch(url);
        const result = await response.json();
        return result?.events || result?.items || [];
      } catch (err) {
        console.error('ERROR:', err);
        return [];
      }
    } else {
      return [];
    }
  }
};

// gets the token from local storage or redirects the user to the Google OAuth URL
const getAccessToken = async () => {
  const accessToken = sessionStorage.getItem('access_token');
  if (accessToken) {
    return accessToken;
  } else {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      return getToken(code);
    } else {
      redirectToAuthUrl();
    }
  }
};

// redirects the user to the Google OAuth URL
const redirectToAuthUrl = async () => {
  const response = await fetch(
    'https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/get-auth-url'
  );
  const { authUrl } = await response.json();
  window.location.href = authUrl;
};

// gets the token from Google OAuth using the provided code
const getToken = async (code) => {
  const encodeCode = encodeURIComponent(code);
  const response = await fetch(
    `https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/token/${encodeCode}`
  );
  const { access_token } = await response.json();
  if (access_token) {
    sessionStorage.setItem('access_token', access_token);
    return access_token;
  } else {
    return null;
  }
};

const App = () => {
  const [allLocations, setAllLocations] = useState([]);
  const [currentNOE, setCurrentNOE] = useState(32);
  const [events, setEvents] = useState([]);
  const [currentCity, setCurrentCity] = useState('See all cities');
  const [infoAlert, setInfoAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  const fetchData = useCallback(async () => {
    const allEvents = await getEvents();
    const filteredEvents =
      currentCity === 'See all cities'
        ? allEvents
        : allEvents.filter((event) => event.location === currentCity);
    setEvents(filteredEvents.slice(0, currentNOE));
    setAllLocations(extractLocations(allEvents));
  }, [currentCity, currentNOE]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // tried below code to test and get past OAuth, but it's not working
  // useEffect(() => {
  //   const code = new URLSearchParams(window.location.search).get('code');
  //   if (code) {
  //     getToken(code);
  //   } else {
  //     const accessToken = getCookie('access_token');
  //     if (!accessToken) {
  //       redirectToAuthUrl();
  //     } else {
  //       fetchData();
  //     }
  //   }
  // }, [fetchData]);

  // const redirectToAuthUrl = async () => {
  //   const response = await fetch(
  //     'https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/get-auth-url'
  //   );
  //   const { authUrl } = await response.json();
  //   window.location.href = authUrl;
  // };

  // const getToken = async (code) => {
  //   const encodeCode = encodeURIComponent(code);
  //   const response = await fetch(
  //     `https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/token/${encodeCode}`
  //   );
  //   const { access_token } = await response.json();
  //   if (access_token) {
  //     // cookie expires in 1 day
  //     setCookie('access_token', access_token, 1);
  //     return access_token;
  //   } else {
  //     return null;
  //   }
  // };

  const handleCurrentNOEChange = (newNOE) => {
    setCurrentNOE(newNOE);
    fetchData();
  };

  const handleCurrentCityChange = (newCity) => {
    setCurrentCity(newCity);
    fetchData();
  };

  return (
    <div className="App" style={{ backgroundImage: `url(${spinningGlobe})` }}>
      <div className="alerts-container">
        {infoAlert && <InfoAlert text={infoAlert} />}
        {errorAlert && <ErrorAlert text={errorAlert} />}
      </div>
      <h1>Meet App</h1>
      <CitySearch
        allLocations={allLocations}
        setCurrentCity={handleCurrentCityChange}
        setInfoAlert={setInfoAlert}
      />
      <NumberOfEvents
        currentNOE={currentNOE}
        setCurrentNOE={handleCurrentNOEChange}
        updateEvents={(count) => setCurrentNOE(count)}
        setErrorAlert={setErrorAlert}
      />
      <EventList events={events} />
    </div>
  );
};

export default App;

// import { useEffect, useState, useCallback } from 'react';
// // import { extractLocations, getEvents } from './api';
// import CitySearch from './components/CitySearch';
// import EventList from './components/EventList';
// import NumberOfEvents from './components/NumberOfEvents';
// import { InfoAlert, ErrorAlert } from './components/Alert';

// import './App.css';
// import spinningGlobe from './spinning_globe.gif';

// import mockData from './mock-data';

// // extracts the locations from the events
// const extractLocations = (events) => {
//   const extractedLocations = events.map((event) => event.location);
//   const locations = [...new Set(extractedLocations)];
//   return locations;
// };

// // gets events from the mockData file if the app is running locally, otherwise it will fetch the events from the Google Calendar API
// const getEvents = async () => {
//   // return [];
//   if (window.location.href.startsWith('http://localhost')) {
//     return mockData;
//   } else {
//     const accessToken = await getAccessToken();
//     console.log({ accessToken });
//     if (accessToken) {
//       try {
//         const url =
//           // URL taken from CF's Google Calendar API get HTTP Request
//           'https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/get-events' +
//           '/' +
//           accessToken;
//         const response = await fetch(url);
//         const result = await response.json();
//         return result?.events || result?.items || [];
//       } catch (err) {
//         console.error('ERROR:', err);
//         return [];
//       }
//     } else {
//       return [];
//     }
//   }
// };

// // gets the token from Google OAuth
// const getAccessToken = async () => {
//   // checks if the access token is in the local storage
//   // const accessToken = sessionStorage.getItem('access_token');
//   const accessToken = sessionStorage.getItem('access_token');
//   if (accessToken) {
//     return accessToken;
//   } else {
//     // redirects the user to the Google OAuth URL
//     const code = new URLSearchParams(window.location.search).get('code');
//     if (code) {
//       return getToken(code);
//     } else {
//       redirectToAuthUrl();
//     }
//   }
// };

// // gets the token from Google OAuth using the provided code
// const getToken = async (code) => {
//   const encodeCode = encodeURIComponent(code);
//   const response = await fetch(
//     `https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/token/${encodeCode}`
//   );
//   const { access_token } = await response.json();
//   if (access_token) {
//     sessionStorage.setItem('access_token', access_token);
//     return access_token;
//   } else {
//     return null;
//   }
// };

// // redirects the user to the Google OAuth URL
// const redirectToAuthUrl = async () => {
//   const response = await fetch(
//     'https://coe3tj5b5f.execute-api.us-east-1.amazonaws.com/dev/api/get-auth-url'
//   );
//   const { authUrl } = await response.json();
//   window.location.href = authUrl;
// };

// const App = () => {
//   // state to store the list of events
//   const [allLocations, setAllLocations] = useState([]);
//   const [currentNOE, setCurrentNOE] = useState(32);
//   const [events, setEvents] = useState([]);
//   const [currentCity, setCurrentCity] = useState('See all cities');
//   const [infoAlert, setInfoAlert] = useState('');
//   const [errorAlert, setErrorAlert] = useState('');

//   // define fetchData using useCallback to memoize the function
//   const fetchData = useCallback(async () => {
//     const allEvents = await getEvents();
//     const filteredEvents =
//       currentCity === 'See all cities'
//         ? allEvents
//         : allEvents.filter((event) => event.location === currentCity);
//     setEvents(filteredEvents.slice(0, currentNOE));
//     setAllLocations(extractLocations(allEvents));
//   }, [currentCity, currentNOE]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // handler function to update the current number of events
//   const handleCurrentNOEChange = (newNOE) => {
//     setCurrentNOE(newNOE);
//   };

//   // handler function to update the current city
//   const handleCurrentCityChange = (newCity) => {
//     setCurrentCity(newCity);
//   };

//   // returns the CitySearch, NOE, and EventList components
//   return (
//     <div className="App" style={{ backgroundImage: `url(${spinningGlobe})` }}>
//       <div className="alerts-container">
//         {/* if infoAlert text >0, means contains text and will show alert; otherwise will render nothing (null) */}
//         {infoAlert.length ? <InfoAlert text={infoAlert} /> : null}
//         {/* if errorAlert text >0, alert is rendered; otherwise renders nothing */}
//         {errorAlert.length ? <ErrorAlert text={errorAlert} /> : null}
//       </div>
//       {/* CitySearch component, passes InfoAlert in case user searches for nonexistent city */}
//       <CitySearch
//         allLocations={allLocations}
//         setCurrentCity={handleCurrentCityChange}
//         setInfoAlert={setInfoAlert}
//       />

//       {/* NumberOfEvents component, passes ErrorAlert if user specifies invalid number */}
//       <NumberOfEvents
//         currentNOE={currentNOE}
//         setCurrentNOE={handleCurrentNOEChange}
//         updateEvents={(count) => {
//           setCurrentNOE(count);
//         }}
//         setErrorAlert={setErrorAlert}
//       />

//       {/* EventList component */}
//       <EventList events={events} />
//     </div>
//   );
// };

// export default App;
