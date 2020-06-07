import LogFactory from '@darkobits/log';


export default LogFactory({
  heading: 'vsct',
  level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL ?? 'info'
});
