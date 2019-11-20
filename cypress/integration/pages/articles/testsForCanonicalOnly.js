import envConfig from '../../../support/config/envs';
import config from '../../../support/config/services';
import appToggles from '../../../support/helpers/useAppToggles';
import { getBlockData } from './helpers';

// TODO: Remove after https://github.com/bbc/simorgh/issues/2959
const serviceHasCaption = service => service === 'news';

// For testing important features that differ between services, e.g. Timestamps.
// We recommend using inline conditional logic to limit tests to services which differ.
export const testsThatAlwaysRunForCanonicalOnly = ({ service, pageType }) => {
  describe(`No testsToAlwaysRunForCanonicalOnly to run for ${service} ${pageType}`, () => {});
};

// For testing feastures that may differ across services but share a common logic e.g. translated strings.
export const testsThatFollowSmokeTestConfigForCanonicalOnly = ({
  service,
  pageType,
}) =>
  describe(`Canonical Tests for ${service} ${pageType}`, () => {
    it('should not have an AMP attribute on the main article', () => {
      cy.get('html').should('not.have.attr', 'amp');
    });

    if (appToggles.chartbeatAnalytics.enabled) {
      describe('Chartbeat', () => {
        if (envConfig.chartbeatEnabled) {
          it('should have a script with src value set to chartbeat source', () => {
            cy.hasScriptWithChartbeatSrc();
          });
          it('should have chartbeat config set to window object', () => {
            cy.hasGlobalChartbeatConfig();
          });
        }
      });
    }

    it('should include ampHTML tag', () => {
      cy.get('head link[rel="amphtml"]').should(
        'have.attr',
        'href',
        `${window.location.origin}${config[service].pageTypes.articles.path}.amp`,
      );
    });

    if (
      Cypress.env('APP_ENV') === 'local' ||
      Cypress.env('APP_ENV') === 'test'
    ) {
      describe.only('Focus', () => {
        beforeEach(() => {
          // visit an article that has an inline link to another article of the same service
          cy.visit('/news/articles/c0g992jmmkko', {
            failOnStatusCode: !pageType.includes('error'),
          });
        });

        it('should not focus on `h1#content` on initial load of a service', () => {
          cy.focused().should('not.have.id', 'content');
        });

        it('should focus on `h1#content` when user navigates to another article of the same service', () => {
          cy.get('main a[href*="/articles/"]').click();

          cy.focused().should('have.id', 'content');
        });
      });
    }
    // Have the test toggle between if mediaPlayer is enabled on live or not
    let imageIndex = 1;
    if (appToggles.mediaPlayer.enabled) {
      imageIndex = 2;
    }

    if (serviceHasCaption(service)) {
      it('should have a visible image without a caption that is lazyloaded and has a noscript fallback image', () => {
        cy.get('figure')
          .eq(imageIndex)
          .within(() => {
            cy.get('div div div div').should(
              'have.class',
              'lazyload-placeholder',
            );
          })
          .scrollIntoView();

        cy.get('figure')
          .eq(imageIndex)
          .should('be.visible')
          .should('to.have.descendants', 'img')
          .should('not.to.have.descendants', 'figcaption')

          // NB: If this test starts failing unexpectedly it's a good sign that the dom is being
          // cleared during hydration. React won't render noscript tags on the client so if they
          // get cleared during hydration, the following render wont re-add them.
          // See https://github.com/facebook/react/issues/11423#issuecomment-341751071 or
          // https://github.com/bbc/simorgh/pull/1872 for more infomation.
          .within(() => {
            cy.get('noscript').contains('<img ');
            cy.get('div div').should('not.have.class', 'lazyload-placeholder');
          });
      });
    }

    // `appToggles` tells us whether a feature is toggled on or off in the current environment.
    if (appToggles.mediaPlayer.enabled) {
      describe('Media Player', () => {
        it('should render a visible placeholder image', () => {
          cy.window().then(win => {
            // `video` blocks can also contain audio.
            const media = getBlockData('video', win.SIMORGH_DATA.pageData);
            if (media) {
              cy.get('div[class^="StyledVideoContainer"]').within(() => {
                cy.get('div[class^="StyledPlaceholder"] > img')
                  .should('be.visible')
                  .should('have.attr', 'src')
                  .should('not.be.empty');
              });
            }
          });
        });

        it('should render a visible guidance message', () => {
          cy.window().then(win => {
            const media = getBlockData('video', win.SIMORGH_DATA.pageData);

            if (media) {
              const longGuidanceWarning =
                media.model.blocks[1].model.blocks[0].model.versions[0].warnings
                  .long;

              cy.get('div[class^="StyledVideoContainer"]')
                .eq(0)
                .within(() => {
                  // Check for video with guidance message
                  if (longGuidanceWarning) {
                    cy.get('div[class^="StyledPlaceholder"]')
                      .within(() => {
                        cy.get('strong');
                      })
                      .should('be.visible')
                      .and('contain', longGuidanceWarning);
                    // Check for video with no guidance message
                  } else {
                    cy.get('div[class^="StyledGuidance"]').should('not.exist');
                  }
                });
            }
          });
        });

        // This test is being temporarily throttled to the service 'news'.
        if (service === 'news') {
          it('should have a visible play button and duration', () => {
            cy.window().then(win => {
              const media = getBlockData('video', win.SIMORGH_DATA.pageData);
              if (media) {
                const aresMediaBlocks = media.model.blocks[1].model.blocks[0];
                const { durationISO8601 } = aresMediaBlocks.model.versions[0];

                cy.get('div[class^="StyledVideoContainer"]').within(() => {
                  cy.get('button')
                    .should('be.visible')
                    .within(() => {
                      cy.get('svg').should('be.visible');
                      cy.get('time')
                        .should('be.visible')
                        .should('have.attr', 'datetime')
                        .and('eq', durationISO8601);
                    });
                });
              }
            });
          });

          it('plays media when a user clicks play', () => {
            cy.window().then(win => {
              const media = getBlockData('video', win.SIMORGH_DATA.pageData);
              if (media && media.type === 'video') {
                cy.get('div[class^="StyledVideoContainer"]')
                  .within(() => {
                    cy.get('button');
                  })
                  .click()
                  .should('not.exist')
                  .then(() => {
                    cy.get('iframe[class^="StyledIframe"]').then($iframe => {
                      cy.wrap($iframe.prop('contentWindow'), {
                        // `timeout` only applies to the methods chained below.
                        // `its()` benefits from this, and will wait up to 8s
                        // for the mediaPlayer instance to become available.
                        timeout: 8000,
                      })
                        .its('embeddedMedia.playerInstances.mediaPlayer')
                        .invoke('currentTime')
                        .should('be.gt', 0);
                    });
                  });
              }
            });
          });
        }
      });
    }
  });

// For testing low priority things e.g. cosmetic differences, and a safe place to put slow tests.
export const testsThatNeverRunDuringSmokeTestingForCanonicalOnly = ({
  service,
  pageType,
}) => {
  describe(`No testsToNeverSmokeTestForCanonicalOnly to run for ${service} ${pageType}`, () => {});
};
