import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TicketsProvider } from './hooks/useTickets';
import Layout from './components/Layout';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <TicketsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<TicketList />} />
            <Route path="tickets/new" element={<CreateTicket />} />
            <Route path="tickets/:ticket_id" element={<TicketDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TicketsProvider>
  );
}

export default App;
