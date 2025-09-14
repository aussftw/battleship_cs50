import { FC } from 'react';

type IconProps = {
  url: string;
  IconComponent: FC;
};

const Icon: React.FC<IconProps> = ({ url, IconComponent }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white p-3 rounded-full transition transform hover:bg-blue-300 hover:-rotate-45"
  >
    <IconComponent />
  </a>
);

export default Icon;
