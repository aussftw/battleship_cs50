import { CURRENT_YEAR } from '@/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-300">
      <div className="footer-text text-center py-4">
        <p className="text-lg">
          Developed and Made with
          <span className="text-red-500 ml-1">&#x2665;</span>
          <br />
          by Alexander Kaminskiy &copy; {CURRENT_YEAR}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
