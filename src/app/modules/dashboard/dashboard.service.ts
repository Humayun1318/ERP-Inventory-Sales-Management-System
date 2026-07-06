import { Customer } from '../customer/customer.models';
import { Product } from '../product/product.models';
import { lowStockFilter } from '../product/product.utils';
import { Sale } from '../sale/sale.models';
import { IDashboardSummary } from './dashboard.interface';

/**
 * getSummary
 * All four figures are independent reads (no shared transaction needed —
 * this is a read-only reporting endpoint, not a business-rule mutation),
 * so they run concurrently for speed.
 */
const getSummary = async (): Promise<IDashboardSummary> => {
  const [
    totalProducts,
    totalCustomers,
    totalSales,
    totalSalesAmount,
    lowStockProducts,
  ] = await Promise.all([
    Product.countDocuments({ isDeleted: false }),
    Customer.countDocuments({ isDeleted: false }),
    Sale.countDocuments(),

    Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: '$grandTotal' },
        },
      },
    ]),

    Product.find(lowStockFilter())
      .select('name sku stockQuantity')
      .sort('stockQuantity')
      .lean(),
  ]);



  return {
    totalProducts,
    totalCustomers,
    totalSales,
    totalSalesAmount: totalSalesAmount[0]?.totalSalesAmount ?? 0,
    lowStockProducts,
  };
};

export const dashboardService = {
  getSummary,
};
















// const pro = [
//   {
//     "name": "Apple MacBook Air M3",
//     "sku": "LAP-1001",
//     "category": "Laptop",
//     "images": ["https://picsum.photos/seed/macbook-m3/800/600"],
//     "purchasePrice": 135000,
//     "sellingPrice": 149990,
//     "stockQuantity": 12
//   },
//   {
//     "name": "Dell XPS 15",
//     "sku": "LAP-1002",
//     "category": "Laptop",
//     "images": ["https://picsum.photos/seed/dell-xps/800/600", "https://picsum.photos/seed/macbook-m3/800/600"],
//     "purchasePrice": 165000,
//     "sellingPrice": 182000,
//     "stockQuantity": 8
//   },
//   {
//     "name": "Logitech MX Master 3S",
//     "sku": "MOU-1001",
//     "category": "Accessories",
//     "images": ["https://picsum.photos/seed/mxmaster3s/800/600"],
//     "purchasePrice": 8500,
//     "sellingPrice": 10500,
//     "stockQuantity": 35
//   },
//   {
//     "name": "Keychron K2 Mechanical Keyboard",
//     "sku": "KEY-1001",
//     "category": "Accessories",
//     "images": ["https://picsum.photos/seed/keychron-k2/800/600"],
//     "purchasePrice": 7800,
//     "sellingPrice": 9500,
//     "stockQuantity": 20
//   },
//   {
//     "name": "Samsung 27-inch 4K Monitor",
//     "sku": "MON-1001",
//     "category": "Monitor",
//     "images": ["https://picsum.photos/seed/samsung-monitor/800/600", "https://picsum.photos/seed/macbook-m3/800/600"],
//     "purchasePrice": 33000,
//     "sellingPrice": 38500,
//     "stockQuantity": 10
//   },
//   {
//     "name": "Apple iPhone 16",
//     "sku": "PHN-1001",
//     "category": "Smartphone",
//     "images": ["https://picsum.photos/seed/iphone16/800/600"],
//     "purchasePrice": 118000,
//     "sellingPrice": 132000,
//     "stockQuantity": 15
//   },
//   {
//     "name": "Samsung Galaxy S25",
//     "sku": "PHN-1002",
//     "category": "Smartphone",
//     "images": ["https://picsum.photos/seed/galaxys25/800/600"],
//     "purchasePrice": 98000,
//     "sellingPrice": 112000,
//     "stockQuantity": 18
//   },
//   {
//     "name": "Sony WH-1000XM5",
//     "sku": "AUD-1001",
//     "category": "Audio",
//     "images": ["https://picsum.photos/seed/sony-xm5/800/600"],
//     "purchasePrice": 32000,
//     "sellingPrice": 36990,
//     "stockQuantity": 14
//   },
//   {
//     "name": "Apple AirPods Pro 2",
//     "sku": "AUD-1002",
//     "category": "Audio",
//     "images": ["https://picsum.photos/seed/airpods-pro2/800/600", "https://picsum.photos/seed/macbook-m3/800/600"],
//     "purchasePrice": 25000,
//     "sellingPrice": 28500,
//     "stockQuantity": 22
//   },
//   {
//     "name": "Canon EOS R50 Camera",
//     "sku": "CAM-1001",
//     "category": "Camera",
//     "images": ["https://picsum.photos/seed/canon-r50/800/600"],
//     "purchasePrice": 89000,
//     "sellingPrice": 98000,
//     "stockQuantity": 6
//   },
//   {
//     "name": "HP LaserJet Pro Printer",
//     "sku": "PRN-1001",
//     "category": "Printer",
//     "images": ["https://picsum.photos/seed/hp-printer/800/600"],
//     "purchasePrice": 18500,
//     "sellingPrice": 22500,
//     "stockQuantity": 9
//   },
//   {
//     "name": "SanDisk Extreme 1TB SSD",
//     "sku": "SSD-1001",
//     "category": "Storage",
//     "images": ["https://picsum.photos/seed/sandisk-ssd/800/600", "https://picsum.photos/seed/macbook-m3/800/600", "https://picsum.photos/seed/macbook-m3/800/600"],
//     "purchasePrice": 9200,
//     "sellingPrice": 11500,
//     "stockQuantity": 30
//   },
//   {
//     "name": "Seagate 2TB External HDD",
//     "sku": "HDD-1001",
//     "category": "Storage",
//     "images": ["https://picsum.photos/seed/seagate-hdd/800/600", "https://picsum.photos/seed/macbook-m3/800/600", "https://picsum.photos/seed/macbook-m3/800/600"],
//     "purchasePrice": 6800,
//     "sellingPrice": 8500,
//     "stockQuantity": 25
//   },
//   {
//     "name": "TP-Link Archer AX55 Router",
//     "sku": "NET-1001",
//     "category": "Networking",
//     "images": ["https://picsum.photos/seed/tplink-router/800/600"],
//     "purchasePrice": 7200,
//     "sellingPrice": 9200,
//     "stockQuantity": 11
//   },
//   {
//     "name": "Acer Aspire 7 Gaming Laptop",
//     "sku": "LAP-1003",
//     "category": "Laptop",
//     "images": ["https://picsum.photos/seed/acer-aspire7/800/600"],
//     "purchasePrice": 78000,
//     "sellingPrice": 89500,
//     "stockQuantity": 7
//   }
// ];

// const cus = [
//   {
//     "name": "Rahim Uddin",
//     "phone": "01711000001",
//     "email": "rahim.uddin@example.com",
//     "address": "Dhanmondi, Dhaka"
//   },
//   {
//     "name": "Karim Hossain",
//     "phone": "01711000002",
//     "email": "karim.hossain@example.com",
//     "address": "Agrabad, Chattogram"
//   },
//   {
//     "name": "Nusrat Jahan",
//     "phone": "01711000003",
//     "email": "nusrat.jahan@example.com",
//     "address": "Khilgaon, Dhaka"
//   },
//   {
//     "name": "Tanvir Ahmed",
//     "phone": "01711000004",
//     "email": "tanvir.ahmed@example.com",
//     "address": "GEC Circle, Chattogram"
//   },
//   {
//     "name": "Sadia Islam",
//     "phone": "01711000005",
//     "email": "sadia.islam@example.com",
//     "address": "Mirpur, Dhaka"
//   },
//   {
//     "name": "Mehedi Hasan",
//     "phone": "01711000006",
//     "email": "mehedi.hasan@example.com",
//     "address": "Sonadanga, Khulna"
//   },
//   {
//     "name": "Farzana Akter",
//     "phone": "01711000007",
//     "email": "farzana.akter@example.com",
//     "address": "Zindabazar, Sylhet"
//   },
//   {
//     "name": "Arif Chowdhury",
//     "phone": "01711000008",
//     "email": "arif.chowdhury@example.com",
//     "address": "Boalia, Rajshahi"
//   },
//   {
//     "name": "Jannatul Ferdous",
//     "phone": "01711000009",
//     "email": "jannatul.ferdous@example.com",
//     "address": "Kotwali, Cumilla"
//   },
//   {
//     "name": "Mahmudul Hasan",
//     "phone": "01711000010",
//     "email": "mahmudul.hasan@example.com",
//     "address": "Uttara, Dhaka"
//   }
// ]
// await Customer.insertMany(cus);

// await Product.insertMany(pro);
// const sale = [
//   {
//     "customer": "6a4c3022593c09178118ac1b",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac1d",
//         "quantity": 1,
//         "unitPrice": 149990
//       },
//       {
//         "product": "6a4c3022593c09178118ac28",
//         "quantity": 2,
//         "unitPrice": 11500
//       }
//     ],
//     "grandTotal": 172990,
//     "createdBy": "6a4c2c5f268504c10a330d43"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac1a",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac22",
//         "quantity": 1,
//         "unitPrice": 132000
//       },
//       {
//         "product": "6a4c3022593c09178118ac20",
//         "quantity": 1,
//         "unitPrice": 9500
//       }
//     ],
//     "grandTotal": 141500,
//     "createdBy": "6a4c2f7a593c09178118ac01"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac19",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac1f",
//         "quantity": 2,
//         "unitPrice": 10500
//       },
//       {
//         "product": "6a4c3022593c09178118ac29",
//         "quantity": 1,
//         "unitPrice": 8500
//       }
//     ],
//     "grandTotal": 29500,
//     "createdBy": "6a4c2f9c593c09178118ac04"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac18",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac2b",
//         "quantity": 1,
//         "unitPrice": 89500
//       }
//     ],
//     "grandTotal": 89500,
//     "createdBy": "6a4c2faf593c09178118ac08"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac17",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac23",
//         "quantity": 1,
//         "unitPrice": 112000
//       },
//       {
//         "product": "6a4c3022593c09178118ac25",
//         "quantity": 2,
//         "unitPrice": 28500
//       }
//     ],
//     "grandTotal": 169000,
//     "createdBy": "6a4c2c5f268504c10a330d43"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac16",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac21",
//         "quantity": 1,
//         "unitPrice": 38500
//       },
//       {
//         "product": "6a4c3022593c09178118ac24",
//         "quantity": 1,
//         "unitPrice": 36990
//       },
//       {
//         "product": "6a4c3022593c09178118ac1f",
//         "quantity": 1,
//         "unitPrice": 10500
//       }
//     ],
//     "grandTotal": 85990,
//     "createdBy": "6a4c2f7a593c09178118ac01"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac15",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac26",
//         "quantity": 1,
//         "unitPrice": 98000
//       },
//       {
//         "product": "6a4c3022593c09178118ac28",
//         "quantity": 3,
//         "unitPrice": 11500
//       }
//     ],
//     "grandTotal": 132500,
//     "createdBy": "6a4c2f9c593c09178118ac04"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac14",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac27",
//         "quantity": 2,
//         "unitPrice": 22500
//       },
//       {
//         "product": "6a4c3022593c09178118ac2a",
//         "quantity": 1,
//         "unitPrice": 9200
//       }
//     ],
//     "grandTotal": 54200,
//     "createdBy": "6a4c2faf593c09178118ac08"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac13",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac1e",
//         "quantity": 1,
//         "unitPrice": 182000
//       },
//       {
//         "product": "6a4c3022593c09178118ac20",
//         "quantity": 2,
//         "unitPrice": 9500
//       }
//     ],
//     "grandTotal": 201000,
//     "createdBy": "6a4c2c5f268504c10a330d43"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac12",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac22",
//         "quantity": 1,
//         "unitPrice": 132000
//       },
//       {
//         "product": "6a4c3022593c09178118ac24",
//         "quantity": 1,
//         "unitPrice": 36990
//       },
//       {
//         "product": "6a4c3022593c09178118ac29",
//         "quantity": 2,
//         "unitPrice": 8500
//       }
//     ],
//     "grandTotal": 185990,
//     "createdBy": "6a4c2f7a593c09178118ac01"
//   }
// ]

// const sale2 = [
//   {
//     "customer": "6a4c3022593c09178118ac1b",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac2b",
//         "quantity": 1,
//         "unitPrice": 89500
//       },
//       {
//         "product": "6a4c3022593c09178118ac1f",
//         "quantity": 2,
//         "unitPrice": 10500
//       }
//     ],
//     "grandTotal": 110500,
//     "createdBy": "6a4c2faf593c09178118ac08"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac1a",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac23",
//         "quantity": 2,
//         "unitPrice": 112000
//       }
//     ],
//     "grandTotal": 224000,
//     "createdBy": "6a4c2c5f268504c10a330d43"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac19",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac25",
//         "quantity": 1,
//         "unitPrice": 28500
//       },
//       {
//         "product": "6a4c3022593c09178118ac24",
//         "quantity": 1,
//         "unitPrice": 36990
//       },
//       {
//         "product": "6a4c3022593c09178118ac20",
//         "quantity": 1,
//         "unitPrice": 9500
//       }
//     ],
//     "grandTotal": 74990,
//     "createdBy": "6a4c2f7a593c09178118ac01"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac18",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac1d",
//         "quantity": 1,
//         "unitPrice": 149990
//       }
//     ],
//     "grandTotal": 149990,
//     "createdBy": "6a4c2f9c593c09178118ac04"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac17",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac29",
//         "quantity": 4,
//         "unitPrice": 8500
//       },
//       {
//         "product": "6a4c3022593c09178118ac2a",
//         "quantity": 2,
//         "unitPrice": 9200
//       }
//     ],
//     "grandTotal": 52400,
//     "createdBy": "6a4c2faf593c09178118ac08"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac16",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac26",
//         "quantity": 1,
//         "unitPrice": 98000
//       },
//       {
//         "product": "6a4c3022593c09178118ac27",
//         "quantity": 1,
//         "unitPrice": 22500
//       }
//     ],
//     "grandTotal": 120500,
//     "createdBy": "6a4c2c5f268504c10a330d43"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac15",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac21",
//         "quantity": 2,
//         "unitPrice": 38500
//       },
//       {
//         "product": "6a4c3022593c09178118ac1f",
//         "quantity": 1,
//         "unitPrice": 10500
//       }
//     ],
//     "grandTotal": 87500,
//     "createdBy": "6a4c2f7a593c09178118ac01"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac14",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac22",
//         "quantity": 1,
//         "unitPrice": 132000
//       },
//       {
//         "product": "6a4c3022593c09178118ac25",
//         "quantity": 1,
//         "unitPrice": 28500
//       }
//     ],
//     "grandTotal": 160500,
//     "createdBy": "6a4c2f9c593c09178118ac04"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac13",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac28",
//         "quantity": 5,
//         "unitPrice": 11500
//       },
//       {
//         "product": "6a4c3022593c09178118ac29",
//         "quantity": 2,
//         "unitPrice": 8500
//       }
//     ],
//     "grandTotal": 74500,
//     "createdBy": "6a4c2faf593c09178118ac08"
//   },
//   {
//     "customer": "6a4c3022593c09178118ac12",
//     "products": [
//       {
//         "product": "6a4c3022593c09178118ac1e",
//         "quantity": 1,
//         "unitPrice": 182000
//       },
//       {
//         "product": "6a4c3022593c09178118ac23",
//         "quantity": 1,
//         "unitPrice": 112000
//       },
//       {
//         "product": "6a4c3022593c09178118ac20",
//         "quantity": 1,
//         "unitPrice": 9500
//       }
//     ],
//     "grandTotal": 303500,
//     "createdBy": "6a4c2c5f268504c10a330d43"
//   }
// ]

// await Sale.insertMany(sale2);
// await Sale.insertMany(sale);