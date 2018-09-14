import LogFactory from '@darkobits/log';

export default LogFactory('vsct', process.env.NODE_ENV === 'test' ? 'silent' : 'info');
