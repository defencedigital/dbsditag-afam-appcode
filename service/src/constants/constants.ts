export const SECTION_COMPLETE = 'section-complete';
export const GOVUK = 'govuk';
export const GOVUK_FRONTEND = 'govuk-frontend';
const INPUT = 'input';
const WIDTH = 'width';
const FIELDSET = 'fieldset';
const LEGEND = 'legend';
const TWO_THIRDS = 'two-thirds';
const GOVUK_WIDTH = `${GOVUK}-!-${WIDTH}`;
const GOVUK_INPUT_WIDTH = `${GOVUK}-${INPUT}--${WIDTH}`;

export const govStyles = {
  INPUT: 'govuk-input',
  INPUT_ERROR: 'govuk-input--error',
  INPUT_WIDTH_2: `${GOVUK_INPUT_WIDTH}-2`,
  INPUT_WIDTH_4: `${GOVUK_INPUT_WIDTH}-4`,
  WIDTH_TWO_THIRDS: `${GOVUK_WIDTH}-${TWO_THIRDS}`,
  FIELDSET_LEGEND_S: `${GOVUK}-${FIELDSET}__${LEGEND}--s`,
  FIELDSET_LEGEND_L: `${GOVUK}-${FIELDSET}__${LEGEND}--l`,
  START_BUTTON: 'govuk-button--start',
};

export const ENVIRONMENT = 'ENVIRONMENT';
export const PRODUCTION = 'production';
