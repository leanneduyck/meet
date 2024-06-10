import { render, within, waitFor } from '@testing-library/react';
import { getEvents } from '../api';
import EventList from '../components/EventList';
import App from '../App';

describe('<EventList /> component', () => {
  let EventListComponent;
  beforeEach(() => {
    EventListComponent = render(<EventList />);
  });

  // test that the EventList component renders with list
  test('has an element with "list" role', () => {
    expect(EventListComponent.queryByRole('list')).toBeInTheDocument();
  });

  // test that the EventList component renders with correct number of events
  test('renders correct number of events', async () => {
    const allEvents = await getEvents();
    EventListComponent.rerender(<EventList events={allEvents} />);
    expect(EventListComponent.getAllByRole('listitem')).toHaveLength(
      allEvents.length
    );
  });
});

// integration test for EventList with App.js
describe('<EventList /> integration', () => {
  test('renders a non-empty list of events when the app is mounted and rendered', async () => {
    const AppComponent = render(<App />);
    const AppDOM = AppComponent.container.firstChild;
    const EventListDOM = AppDOM.querySelector('#event-list');
    await waitFor(() => {
      const EventListItems = within(EventListDOM).queryAllByRole('listitem');
      expect(EventListItems.length).toBe(32);
    });
  });
});

// //
// original code
// import { render, screen, within, waitFor } from '@testing-library/react';
// import { getEvents } from '../api';
// import App from '../App';
// import EventList from '../components/EventList';

// describe('<EventList /> component', () => {
//   // test that the EventList component renders correctly
//   test('has an element with "list" role', () => {
//     render(<EventList />);
//     expect(screen.queryByRole('list')).toBeInTheDocument();
//   });

//   // test that the EventList component renders correctly
//   test('renders correct number of events', async () => {
//     const allEvents = await getEvents();
//     render(<EventList events={allEvents} />);
//     expect(screen.getAllByRole('listitem')).toHaveLength(allEvents.length);
//   });
// });

// // test that EventList integrates correctly with App.js
// describe('<EventList /> integration', () => {
//   test('renders a list of 32 events when the app is mounted and rendered', async () => {
//     const AppComponent = render(<App />);
//     const AppDOM = AppComponent.container.firstChild;
//     const EventListDOM = AppDOM.querySelector('#event-list');
//     await waitFor(() => {
//       const EventListItems = within(EventListDOM).queryAllByRole('listitem');
//       expect(EventListItems.length).toBe(32);
//     });
//   });
// });