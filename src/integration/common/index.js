import runA11yTests from './a11y';
import runAmpAnalyticsTests from './analytics.amp';
import runCanonicalAnalyticsTests from './analytics.canonical';
import runCoreAmpTests from './core.amp';
import runCoreCanonicalTests from './core.canonical';
import runFooterTests from './footer';
import runHeaderTests from './header';
import runMainHeadingTests from './mainHeading';
import runMediaPlayerEmbedTests from './mediaPlayerEmbed';
import runPerformanceTests from './performance';
import runRadioScheduleTests from './radioSchedule';
import runCrossPlatformSEOTests from './SEO';
import runSeoAmpTests from './SEO.amp';
import runTimestampTests from './timestamp';
import runImageTests from './image';
import runAppleItunesAppBannerTests from './appleItunesAppBanner';
import runStoryPromoTests from './storyPromo';
import runSectionTests from './sections';

const runCommonCrossPlatformTests = service => {
  runA11yTests();
  runHeaderTests(service);
  runFooterTests();
  runPerformanceTests();
  runCrossPlatformSEOTests();
  runMainHeadingTests();
};

export {
  runA11yTests,
  runAmpAnalyticsTests,
  runCanonicalAnalyticsTests,
  runCommonCrossPlatformTests,
  runCoreAmpTests,
  runCoreCanonicalTests,
  runFooterTests,
  runHeaderTests,
  runMainHeadingTests,
  runMediaPlayerEmbedTests,
  runPerformanceTests,
  runRadioScheduleTests,
  runCrossPlatformSEOTests,
  runSeoAmpTests,
  runTimestampTests,
  runImageTests,
  runAppleItunesAppBannerTests,
  runStoryPromoTests,
  runSectionTests,
};
