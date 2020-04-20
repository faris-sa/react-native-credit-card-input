import valid from "card-validator";
import { removeNonNumber, removeLeadingSpaces } from "./Utilities";
import pick from "lodash.pick";

const limitLength = (string = "", maxLength) => string.substr(0, maxLength);
const addGaps = (string = "", gaps) => {
  const offsets = [0].concat(gaps).concat([string.length]);

  return offsets.map((end, index) => {
    if (index === 0) return "";
    const start = offsets[index - 1];
    return string.substr(start, end - start);
  }).filter(part => part !== "").join(" ");
};

const FALLBACK_CARD = { gaps: [4, 8, 12], lengths: [16], code: { size: 3 } };
export default class CCFieldFormatter {
  constructor(displayedFields) {
    this._displayedFields = [...displayedFields, "type"];
    valid.creditCardType.addCard({
      niceType: 'Mada Card',
      type: 'mada',
      patterns: [
        588845,440647,440795,446404,457865,968208,588846,493428,539931,558848,557606,968210,636120,417633,468540,468541,468542,468543,968201,446393,588847,400861,409201,458456,484783,968205,462220,455708,588848,455036,968203,486094,486095,486096,504300,440533,489317,489318,489319,445564,968211,401757,410685,432328,428671,428672,428673,968206,446672,543357,434107,431361,604906,521076,588850,968202,535825,529415,543085,524130,554180,549760,588849,968209,524514,529741,537767,535989,536023,513213,585265,588983,588982,589005,508160,531095,530906,532013,588851,605141,968204,422817,422818,422819,428331,483010,483011,483012,589206,968207,419593,439954,407197,407395,520058,530060,531196
      ],
      gaps: [4, 8, 12],
      lengths: [16],
      code: {
        name: 'CVV',
        size: 3
      }
    });
  }

  formatValues = (values) => {
    const card = valid.number(values.number).card || FALLBACK_CARD;

    return pick({
      type: card.type,
      number: this._formatNumber(values.number, card),
      expiry: this._formatExpiry(values.expiry),
      cvc: this._formatCVC(values.cvc, card),
      name: removeLeadingSpaces(values.name),
      postalCode: removeNonNumber(values.postalCode),
    }, this._displayedFields);
  };

  _formatNumber = (number, card) => {
    const numberSanitized = removeNonNumber(number);
    const maxLength = card.lengths[card.lengths.length - 1];
    const lengthSanitized = limitLength(numberSanitized, maxLength);
    const formatted = addGaps(lengthSanitized, card.gaps);
    return formatted;
  };

  _formatExpiry = (expiry) => {
    const sanitized = limitLength(removeNonNumber(expiry), 4);
    if (sanitized.match(/^[2-9]$/)) { return `0${sanitized}`; }
    if (sanitized.length > 2) { return `${sanitized.substr(0, 2)}/${sanitized.substr(2, sanitized.length)}`; }
    return sanitized;
  };

  _formatCVC = (cvc, card) => {
    const maxCVCLength = card.code.size;
    return limitLength(removeNonNumber(cvc), maxCVCLength);
  };
}
