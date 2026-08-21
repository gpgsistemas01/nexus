import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const ISSUE_FLOWS = [
  {
    name: 'salidas de material',
    files: [
      [
        'src/controllers/api/warehouse/goodsIssueController.js',
        [
          'export const getAllGoodsIssues',
          'export const registerGoodsIssue',
          'export const editGoodsIssue =',
          'export const editGoodsIssueHeader',
          'export const editGoodsIssueDetails',
          'export const returnGoodsIssueDetail'
        ]
      ],
      [
        'src/services/warehouse/goodsIssues/goodsIssueService.js',
        [
          'export const findAllGoodsIssues',
          'export const createGoodsIssue',
          'export const updateGoodsIssue =',
          'export const updateGoodsIssueHeader',
          'export const updateGoodsIssueDetails'
        ]
      ],
      [
        'src/routes/api/warehouse/goodsIssueApiRoute.js',
        [
          "router.get(\n    '/'",
          "router.post(\n    '/'",
          "router.patch(\n    '/:id'",
          "router.patch(\n    '/:id/header'",
          "router.patch(\n    '/:id/details'",
          "router.patch(\n    '/:id/details/:detailId/returns'"
        ]
      ],
      [
        'src/public/js/services/warehouse/goodsIssueService.js',
        [
          'getAllGoodsIssuesRequest',
          'registerGoodsIssueRequest',
          'editGoodsIssueRequest',
          'editGoodsIssueHeaderRequest',
          'editGoodsIssueDetailsRequest',
          'returnGoodsIssueDetailRequest'
        ]
      ],
      [
        'src/public/js/application/warehouse/goodsIssues/goodsIssues.js',
        [
          'getAllGoodsIssues =',
          'registerGoodsIssue =',
          'export const editGoodsIssue =',
          'editGoodsIssueHeader =',
          'editGoodsIssueDetails =',
          'returnGoodsIssueDetail ='
        ]
      ]
    ]
  },
  {
    name: 'salidas de merma',
    files: [
      [
        'src/controllers/api/warehouse/wasteIssueController.js',
        [
          'export const getAllWasteIssues',
          'export const registerWasteIssue',
          'export const editWasteIssue =',
          'export const editWasteIssueHeader',
          'export const editWasteIssueDetails',
          'export const returnWasteIssueDetail'
        ]
      ],
      [
        'src/services/warehouse/wasteIssues/wasteIssueService.js',
        [
          'export const findAllWasteIssues',
          'export const createWasteIssue',
          'export const updateWasteIssue =',
          'export const updateWasteIssueHeader',
          'export const updateWasteIssueDetails'
        ]
      ],
      [
        'src/routes/api/warehouse/wasteIssueApiRoute.js',
        [
          "router.get(\n    '/'",
          "router.post(\n    '/'",
          "router.patch(\n    '/:id'",
          "router.patch(\n    '/:id/header'",
          "router.patch(\n    '/:id/details'",
          "router.patch(\n    '/:id/details/:detailId/returns'"
        ]
      ],
      [
        'src/public/js/services/warehouse/wasteIssueService.js',
        [
          'getAllWasteIssuesRequest',
          'registerWasteIssueRequest',
          'editWasteIssueRequest',
          'editWasteIssueHeaderRequest',
          'editWasteIssueDetailsRequest',
          'returnWasteIssueDetailRequest'
        ]
      ],
      [
        'src/public/js/application/warehouse/wasteIssues/wasteIssues.js',
        [
          'getAllWasteIssues =',
          'registerWasteIssue =',
          'export const editWasteIssue =',
          'editWasteIssueHeader =',
          'editWasteIssueDetails =',
          'returnWasteIssueDetail ='
        ]
      ]
    ]
  }
];

const ISSUE_PAGES = [
  {
    file: 'src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js',
    operations: [
      'goodsIssueReturn.initialize()',
      '\nexport const openGoodsIssueModal'
    ]
  },
  {
    file: 'src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js',
    operations: [
      'wasteIssueReturn.initialize()',
      '\nexport const openWasteIssueModal',
      'const findDetailByElement'
    ]
  }
];

const findPositions = (source, operations) => operations.map((operation) => source.indexOf(operation));

describe.each(ISSUE_FLOWS)('orden CRUD de $name', ({ files }) => {
  it.each(files)('mantiene consulta, creación y mutaciones de lo general a lo específico en %s', (file, operations) => {
    const positions = findPositions(readFileSync(file, 'utf8'), operations);

    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });
});

describe('orden de coordinación de páginas de salidas', () => {
  it.each(ISSUE_PAGES)('ubica modal y detalles en el mismo orden en $file', ({ file, operations }) => {
    const positions = findPositions(readFileSync(file, 'utf8'), operations);

    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });
});
