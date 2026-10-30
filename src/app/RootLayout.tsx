import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { cx } from '../shared/lib/cx';

export function RootLayout() {
  const navigation = useNavigation();

  return (
    <>
      <div className={cx('progress', navigation.state !== 'idle' && 'is-active')} aria-hidden="true" />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
