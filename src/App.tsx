import { Footer, Header } from '@/components';
import { useState, useCallback } from 'react';
import { Game, Welcome } from '@/pages';

function App() {
  const [isWelcomeOpen, setIsWelCome] = useState<boolean>(true);

  const onPress = useCallback(() => {
    setIsWelCome(false);
  }, []);

  const renderComponent = isWelcomeOpen ? (
    <Welcome onPress={onPress} />
  ) : (
    <Game />
  );

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">{renderComponent}</div>
        <Footer />
      </div>
    </>
  );
}

export default App;
