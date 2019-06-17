import React, { Fragment, useContext } from 'react';
import { shape } from 'prop-types';
import StoryPromoComponent, {
  Headline,
  Summary,
  Link,
} from '@bbc/psammead-story-promo';
import Timestamp from '@bbc/psammead-timestamp-container';
import { storyItem } from '../../models/propTypes/storyItem';
import { ServiceContext } from '../../contexts/ServiceContext';
import deepGet from '../../lib/json/deepGet';

import StoryPromoFigure from './Figure';
import LinkContents from './LinkContents';
import MediaIndicator from './MediaIndicator';

const StoryPromo = ({ item }) => {
  const { script } = useContext(ServiceContext);
  const headline = deepGet(['headlines', 'headline'], item);
  const url = deepGet(['locators', 'assetUri'], item);
  const summary = deepGet(['summary'], item);
  const timestamp = deepGet(['timestamp'], item);
  const imageValues = deepGet(['indexImage'], item);

  const Image = imageValues && <StoryPromoFigure {...imageValues} />;

  if (!headline || !url) {
    return null;
  }

  const Info = (
    <Fragment>
      {headline && (
        <Headline script={script}>
          <Link href={url}>
            <LinkContents item={item} />
          </Link>
        </Headline>
      )}
      {summary && <Summary script={script}>{summary}</Summary>}
      {timestamp && (
        <Timestamp
          timestamp={timestamp * 1000}
          dateTimeFormat="YYYY-MM-DD"
          format="D MMMM YYYY"
          script={script}
          padding={false}
        />
      )}
    </Fragment>
  );

  return (
    <StoryPromoComponent
      image={Image}
      info={Info}
      mediaIndicator={<MediaIndicator item={item} />}
    />
  );
};

StoryPromo.propTypes = {
  item: shape(storyItem).isRequired,
};

export default StoryPromo;
